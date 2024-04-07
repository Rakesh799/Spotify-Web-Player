let currentsong = new Audio()
let songs;
let currFolder;
function SecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(remainingSeconds).padStart(2, '0')

    return `${formattedMinutes}:${formattedSeconds}`
}

async function getSongs(folder) {
    currFolder = folder;

    let a = await fetch(`/${currFolder}/`)
    let response = await a.text();
    // console.log(response);

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    // console.log(as);

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${currFolder}`)[1])
        }
    }


    //Show all the songs in the PlayList
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
           <img src="image/music.svg" alt="">
           <div class="info">
               <div>${song.replaceAll("%20", " ")}</div>
               <div>Rakesh</div>
           </div>
           <div class="playnow">
               <span>Play Now</span>
               <img src="image/play.svg" alt="">
           </div>
           </li>`
    }

    // Attaching an EventListener to Each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li"))
        .forEach(e => {

            e.addEventListener("click", element => {

                playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            })
        });


    return songs;
}


// Function to play music
const playMusic = (track, pause = false) => {
    currentsong.src = `/${currFolder}/` + track

    if (!pause) {
        currentsong.play()
        play.src = "image/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

}



async function displayAlbum() {
    let a = await fetch(`/Songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");

    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/Songs/")) {
            let folder = e.href.split("/").slice(-1)[0];

            //Get the metadata of the folder
            let a = await fetch(`/Songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response);

            let cardContainer = document.querySelector(".cardContainer")

            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/image/2000/svg" width="40" height="40" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="12" fill="#1fdf64" />
                    <path d="M8 5v14l10-7L8 5z" fill="black" />
                </svg>
            </div>
            <div><img src="/Songs/${folder}/cover.jpg" alt=""></div>
            <h3>${response.title}</h3>
            <p>${response.description}</p>  
        </div>`

        }
    };


    // Load the Playlist whenever the card is clicked   
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {

            songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}/`)
            playMusic(songs[0])
        })
    });


}



async function main() {


    //Get the list of all the songs
    await getSongs("Songs/Arijit/")
    // console.log(songs);
    playMusic(songs[0], true)


    // Display all the albums on the page
    await displayAlbum()


    //Attach an EventListener to play button
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "image/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "image/play.svg"
        }
    })


    // Add an event listener to Previous
    previous.addEventListener("click", () => {

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if (index - 1 >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to Next
    next.addEventListener("click", () => {

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1])
        }
    })


    //Listen for time update event. 
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime, currentsong.duration);

        document.querySelector(".songtime").innerHTML = `${SecondsToMinutes(currentsong.currentTime)} / ${SecondsToMinutes(currentsong.duration)}`

        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";

    })



    //Add an Event Listener to Seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {

        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";

        currentsong.currentTime = ((currentsong.duration) * percent) / 100


    })

    //Add an EventListener to Hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    //Add an EventListener to Close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })



    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {

        console.log(`Setting Volume to ${e.target.value}/ 100`);

        currentsong.volume = parseInt(e.target.value) / 100

        if(currentsong.volume > 0){
            document.querySelector(".volume > img").src = document.querySelector(".volume > img").src.replace("mute.svg", "volume.svg");
        }

    })

    // Add event listener to Mute the Track
    document.querySelector(".volume > img").addEventListener("click", e => {

        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentsong.volume = .1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })

}



main()
