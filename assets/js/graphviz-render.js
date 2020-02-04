(function() {
  let inputs = document.getElementsByClassName("graphviz")
  var viz = new Viz();

  for (let item of inputs) {
    // see: https://developer.mozilla.org/en-US/docs/Web/API/Node
    (function() {
      let self = item;

      viz.renderSVGElement(item.textContent)
      .then(function(element) {
        self.parentElement.insertBefore(element, self);
        self.parentElement.removeChild(self);
      })
      .catch(error => {
        /* Create a new Viz instance (@see Caveats page for more info) */
        viz = new Viz();
        self.textContent = error;
        /* Possibly display the error */
        console.error(error);
      });
    })()
  }
})() 