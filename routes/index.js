var express = require('express');
var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://192.168.25.55');
var router = express.Router();
var fs = require('fs');
var imagenes = [];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/camara', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  const id = new Date().getTime();
  const PiCamera = require('pi-camera');
  const myCamera = new PiCamera({
  mode: 'photo',
  output: `${ __dirname }/../imagenes/${id}.jpg`,
  width: 640,
  height: 480,
  nopreview: true,
});
 
myCamera.snap()
  .then((result) => {
    // Your picture was captured
   fs.appendFile(`${__dirname}/../imagenes.txt`, `${id},`, (err)=>{if(err){console.log('error al guardar el id en imagenes.');}});

   res.json({'imagenes': id});
  })
  .catch((error) => {
     // Handle your error
  });
});

router.get('/imagen',(req,res,next)=>{
 fs.readFile(`${__dirname}/../imagenes.txt`, 'utf-8', (err, data)=>{
   if(err){
    res.json({'error': 'No se pudo cargar el archivo que contiene el id de imagenes', 'imagenes': null});
   }else{
    data = data.split(',');
    data.pop();
    res.json({'imagenes': data});
   }
});
});

router.get('/imagen/:id', function(req, res, next) {
 //console.log(fs.read(`${__dirname}/../imagenes.txt`));
 res.sendFile(`/home/pi/Documents/myapp/imagenes/${req.params.id}.jpg`);
});


router.get('/video',(req,res,next)=>{
 fs.readFile(`/home/pi/Documents/myapp/videos.txt`, 'utf-8', (err, data)=>{
   if(err){
    res.json({'error': 'No se pudo cargar el archivo que contiene el id de videos', 'imagenes': null});
   }else{
    data = data.split(',');
    data.pop();
    res.json({'videos': data});
   }
});
});

router.get('/video/:id', function(req, res, next) {
  var path = `/home/pi/Documents/myapp/videos/${req.params.id}.mp4`;
  
  res.sendFile(path);
});


router.get('/grabarvideo', function(req, res, next) {
const PiCamera = require('pi-camera');
const id = new Date().getTime();
const flag = false;
const myCamera = new PiCamera({
  mode: 'video',
  output: `/home/pi/Documents/myapp/videos/${id}.h264`,
  width: 1280,
  height: 720,
  timeout: 10000, // Record for 5 seconds
  nopreview: true,
});

myCamera.record()
  .then((result) => {
    // Your video was captured
    // res.sendFile(`${__dirname}/test.jpg`);

    var ffmpeg = require('fluent-ffmpeg');
    var inFilename = `/home/pi/Documents/myapp/videos/${id}.h264`;
    var outFilename = `/home/pi/Documents/myapp/videos/${id}.mp4`;
   fs.appendFile(`/home/pi/Documents/myapp/videos.txt`, `${id},`, (err)=>{if(err){console.log('error al guardar el id en videos.');}});

    ffmpeg(inFilename)
      .outputOptions("-c:v", "copy") // this will copy the data instead or reencode it
      .save(outFilename);
    res.json({'idvideo': id});
  })
  .catch((error) => {
     // Handle your error
  });

});

router.get('/moverservo', function(req, res, next) {
// client.on('connect', () => { 
  client.publish('movimiento', '1');
  res.json({});

});


module.exports = router;
