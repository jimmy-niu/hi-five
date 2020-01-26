window.onload = () => {
  // Login to Firebase
  firebase.auth().signInAnonymously().catch(function(error) {
    alert(error.message)
  })

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      const extractDate = str => str.match(/(\d{4})-(\d{1,2})-(\d{1,2})\.webm/)

      const populateVideos = (ref, prefix) => {
        ref.listAll()
        .then(({ items }) => {
          items
            .filter(({ fullPath }) => extractDate(fullPath))
            .forEach(({ fullPath }) => {
              storageRef.child(fullPath).getDownloadURL()
              .then(videoURL => {
                // TODO: Handle month and year changes
                const daysPast = new Date().getDate() - (+extractDate(videoURL)[3])

                if (daysPast === 0) {
                  const video = document.querySelector(`#${prefix}-header-video`)
    
                  video.src = videoURL
                }

                if (1 <= daysPast || daysPast <= 6) {
                  const video = document.querySelector(`#${prefix}-${daysPast}`)
    
                  video.src = videoURL
                }
              })
            })
        })
        .catch(e => alert(e.message))
      }

      // Get your videos
      const storageRef = firebase.storage().ref()
      const userFolderRef = storageRef.child(`/user/${user.uid}`)

      populateVideos(userFolderRef, 'your')

      // Get partner videos
      const db = firebase.firestore()
      db.collection("groups").doc(user.uid).get().then(doc => {
        const partnerFolderRef = storageRef.child(`/user/${doc.data().partnerID}`)
        populateVideos(partnerFolderRef, 'partner')
      })
    }
  })

  // Create videos
  const videoCalendarContainer = document.querySelector('.video-calendar-container')

  // 0 indexed video goes in main display
  const yourVideos = Array(6).fill(0).map((_, i) => createVideo(`your-${i + 1}`))
  const partnerVideos = Array(6).fill(0).map((_, i) => createVideo(`partner-${i + 1}`))

  const pairs = yourVideos.map((vid, i) => createPair(vid, partnerVideos[i]))

  appendChildren(videoCalendarContainer, pairs)
}

/**
 * @param {VideoNode} video1 The first video in the pair
 * @param {VideoNode} video2 The second video in the pair
 */
function createPair(video1, video2) {
  const container = htmlToElements(`<div class="video-pair"></div>`)[0]
  appendChildren(container, video1, video2)
  return container
}

/**
 * @param {String} src URL for the video
 * @param {Number} width optional width of the video
 * @param {Number} height optional height of the video
 * @return {VideoNode}
 */
function createVideo(id, width = 100, height = 100) {
  return htmlToElements(
    `<video id="${id}" width="${width}" height="${height}" autoplay muted loop>
      <source src="" />
      Video could not be loaded
    </video>`
  )[0]
}

/**
 * @param {String} HTML representing any number of sibling elements
 * @return {NodeList} 
 */
function htmlToElements(html) {
  var template = document.createElement('template');
  template.innerHTML = html;
  return template.content.childNodes;
}

/**
 * @param {Node} node target to append to
 * @param  {...any} children nodes to append
 */
function appendChildren(node, ...children){
  const documentFragment = document.createDocumentFragment()

  children.forEach(child => {
    if (Array.isArray(child)) {
      child.forEach(child => documentFragment.appendChild(child))
    } else {
      documentFragment.appendChild(child);
    }
  })

  node.appendChild(documentFragment)
}