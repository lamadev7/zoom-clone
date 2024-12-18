
console.log({a: baseUrl})

let myVideoStream;

const hostDetails = new URL(baseUrl);
const socket = io(baseUrl);

const peerConfig = {
     path: '/peerjs', 
     host: hostDetails.hostname,
     ...(hostDetails?.port ? {port: hostDetails.port} : {})
}
console.log({hostDetails, peerConfig})

const peerInstance = new Peer(undefined, peerConfig);
const videoContainer = document.getElementById("video-container");

peerInstance.on('open', (id) => {
    socket.emit("join-room", roomId, id);
});

peerInstance.on('call', (call) => {
    call.answer(myVideoStream);

    const videoElement = document.createElement("video");
    call.on('stream', (newStream) => {
        addToVideoStream(videoElement, newStream);
    });

    call.on('close', () => {
        videoElement.remove();
    })
});

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then((stream) => {
    myVideoStream = stream;
    const videoElement = document.createElement("video");

    addToVideoStream(videoElement, stream);

    socket.on("user-connected", (peerId) => {
        connectNewUser(peerId, myVideoStream);
    });
}).catch((error) => {
    console.error("Error getting media:", error);
});

const addToVideoStream = (videoElement, stream) => {
    videoElement.muted = true;
    videoElement.srcObject = stream;
    videoElement.addEventListener('loadedmetadata', () => {
        videoElement.play();
    });

    videoContainer.append(videoElement);
};

const connectNewUser = (peerId, stream) => {
    const call = peerInstance.call(peerId, stream);
    const videoElement = document.createElement("video");
    addToVideoStream(videoElement, stream);

    call.on('close', () => {
        videoElement.remove();
    })
};
