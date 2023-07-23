const express = require('express');
const fs = require('fs');
const path = require('path');

const cors = require('cors');
const app = express();
app.use(cors());

// const videoPath = path.join(__dirname, 'path', 'to', 'your', 'video.mp4');

const videoPath = path.join(__dirname, 'meet.mp4');

app.get('/video', (req, res) => {
    const startByte = parseInt(req.query.start, 10) || 0;
    const endByte = parseInt(req.query.end, 10) || (fs.statSync(videoPath).size - 1);

    const stream = fs.createReadStream(videoPath, { start: startByte, end: endByte });

    stream.on('open', () => {
        res.status(206) // Partial Content
        res.setHeader('Content-Range', `bytes ${startByte}-${endByte}/${fs.statSync(videoPath).size}`);
        res.setHeader('Content-Length', endByte - startByte + 1);
        res.setHeader('Content-Type', 'video/mp4');
        stream.pipe(res);
    });

    stream.on('error', (err) => {
        console.error(err.message);
        res.sendStatus(500);
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});



"Http failure response for http://localhost:3000/video: 0 Unknown Error"