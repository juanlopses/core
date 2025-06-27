const express = require('express');
const ytdl = require('@distube/ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Endpoint: Información básica
app.get('/api/basic-info', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const info = await ytdl.getBasicInfo(url);
    res.json(info.videoDetails);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch video info', details: err.message });
  }
});

// Endpoint: Información completa y formatos
app.get('/api/formats', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const info = await ytdl.getInfo(url);
    const formats = info.formats
      .filter(f => f.hasVideo || f.hasAudio)
      .map(f => ({
        itag: f.itag,
        container: f.container,
        qualityLabel: f.qualityLabel || null,
        hasAudio: f.hasAudio,
        hasVideo: f.hasVideo,
        mimeType: f.mimeType,
        bitrate: f.bitrate,
        sizeMB: f.contentLength ? (parseInt(f.contentLength) / 1024 / 1024).toFixed(2) : null
      }));

    res.json({ title: info.videoDetails.title, formats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get formats', details: err.message });
  }
});

// Endpoint: Descargar video (opcional itag)
app.get('/api/download', async (req, res) => {
  const { url, itag } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const info = await ytdl.getBasicInfo(url);
    const title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, "_");

    res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);

    const options = itag ? { quality: itag } : {};
    ytdl(url, options).pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'Failed to download video', details: err.message });
  }
});

// Endpoint: Descargar solo audio (M4A)
app.get('/api/download-audio', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const info = await ytdl.getBasicInfo(url);
    const title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, "_");

    res.setHeader('Content-Disposition', `attachment; filename="${title}.m4a"`);
    res.setHeader('Content-Type', 'audio/mp4');

    ytdl(url, {
      filter: 'audioonly',
      quality: 'highestaudio'
    }).pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'Failed to download audio', details: err.message });
  }
});

// Endpoint: Descargar y convertir audio a MP3
app.get('/api/download-audio-mp3', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const info = await ytdl.getBasicInfo(url);
    const title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, "_");

    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');

    const audioStream = ytdl(url, {
      filter: 'audioonly',
      quality: 'highestaudio'
    });

    ffmpeg(audioStream)
      .format('mp3')
      .audioBitrate(192)
      .on('error', (err) => {
        console.error(err);
        res.status(500).json({ error: 'FFmpeg error', details: err.message });
      })
      .pipe(res, { end: true });

  } catch (err) {
    res.status(500).json({ error: 'Failed to convert audio', details: err.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 API YouTube lista en http://localhost:${PORT}`);
});
