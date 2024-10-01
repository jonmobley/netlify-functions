const https = require('https');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { api, videoId } = JSON.parse(event.body);

    let url, headers = {};

    if (api === 'vimeo') {
      url = `https://api.vimeo.com/videos/${videoId}`;
      headers['Authorization'] = `Bearer ${process.env.VIMEO_API_KEY}`;
    } else if (api === 'youtube') {
      url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`;
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid API specified' }) };
    }

    return new Promise((resolve, reject) => {
      https.get(url, { headers }, (resp) => {
        let data = '';
        resp.on('data', (chunk) => data += chunk);
        resp.on('end', () => {
          resolve({
            statusCode: 200,
            body: data
          });
        });
      }).on("error", (err) => {
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to fetch video data', details: err.message })
        });
      });
    });
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request body', details: error.message })
    };
  }
};
