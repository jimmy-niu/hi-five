const VIDEO_SETTINGS = {
  audio: false,
  video: { width: 800, height: 800, facingMode: 'environment' }
}

const RECORD_OPTIONS = { mimeType: "video/webm; codecs=vp8" }
const RECORD_TIME_MS = 1000

let mediaStream = null
let recordedChunks = []

function startCameraPreview() {
  navigator.mediaDevices.getUserMedia(VIDEO_SETTINGS)
  .then(stream => {
    const video = document.querySelector('#video-preview')

    video.srcObject = stream;
    video.onloadedmetadata = () => video.play()
    mediaStream = stream
  })
  .catch((err) => alert(err.name + ": " + err.message))
}

function recordOneSecond() {
  mediaRecorder = new MediaRecorder(mediaStream, RECORD_OPTIONS)
  recordedChunks = []

  mediaRecorder.ondataavailable = handleDataAvailable
  mediaRecorder.start()

  setTimeout(() => {
    mediaRecorder.stop()
  }, RECORD_TIME_MS)
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function handleDataAvailable(event) {
  if (event.data.size > 0) {
    recordedChunks.push(event.data)
	let uploadName; 
	try {
		let d = fakeDate();
		uploadName = [d.getFullYear(), pad(d.getMonth() + 1, 2), pad(d.getDate(), 2)].join("-")
	} catch { uploadName = 'testVid'; }
	upload(uploadName);
  }
}

function getPath(name) {
  return `/user/${firebase.auth().currentUser.uid}/${name}.webm`
}

function upload(name) {
  const storageRef = firebase.storage().ref()
  const videoRef = storageRef.child(getPath(name))

  var blob = new Blob(recordedChunks, {
    type: "video/webm"
  })

  videoRef.put(blob).then(() => {
    console.log('Uploaded Successfully!')
  })
}

function download(name) {
  const storageRef = firebase.storage().ref()
  const videoRef = storageRef.child(getPath(name))

  videoRef.getDownloadURL()
  .then((url) => {
    console.log(url)
    document.querySelector('#left-header-video source').setAttribute('src', url)
    document.querySelector('#left-header-video').load()
  })
  .catch(err => alert(err.message))
}
