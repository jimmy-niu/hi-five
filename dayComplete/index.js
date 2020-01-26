window.onload = () => {
  const videoCalendarContainer = document.querySelector('.video-calendar-container')

  const yourVideos = Array(7).fill(0).map(_ => createVideo('http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4'))
  const otherVideos = Array(7).fill(0).map(_ => createVideo('http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4'))

  const pairs = yourVideos.map((vid, i) => createPair(vid, otherVideos[i]))

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
function createVideo(src, width = 100, height = 100) {
  return htmlToElements(
    `<video width="${width}" height="${height}" autoplay muted loop>
      <source src="${src}" />
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