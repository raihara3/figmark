import "./ui.css"

/* ===== post message ===== */

// function onPostMessage(type, value) {
//   parent.postMessage({ pluginMessage: { type, value } }, "*")
// }

/* ===== create bookmarak list ===== */

const MAX_TEXT_LENGTH = 30
let listWrapper, e_div, e_li, e_button

window.addEventListener("load", () => {
  document.getElementById("add-button").addEventListener("click", () => {
    parent.postMessage({ pluginMessage: { type: "add-bookmark"} }, "*")
  })

  listWrapper = document.getElementById("figmark-list")

  // elements
  e_div = document.createElement("div")
  e_li = document.createElement("li")
  e_li.setAttribute("draggable", "true")
  e_button = document.createElement("button")
  e_button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/></svg>
    `

  document.addEventListener("keydown", (e) => {
    if(e.key === "ArrowDown") {
      const selected = document.querySelector(".selected")
      if(!selected.nextElementSibling) return
      selected.classList.remove("selected")
      selected.nextElementSibling.classList.add("selected")
      selected.nextElementSibling.getElementsByTagName("div")[0].click()
    }else if(e.key === "ArrowUp") {
      const selected = document.querySelector(".selected")
      if(!selected.previousElementSibling) return
      selected.classList.remove("selected")
      selected.previousElementSibling.classList.add("selected")
      selected.previousElementSibling.getElementsByTagName("div")[0].click()
    }
  })

  parent.postMessage({ pluginMessage: { type: "get-figmark" }}, "*")
})

onmessage = (event) => {
  console.log(event)
  const data = event.data.pluginMessage

  if(data.type === "update-figmark") {
    listWrapper.innerHTML = ""
    data.value.forEach(v => {
      const li = e_li.cloneNode(true)
      li.id = v.id

      const div = e_div.cloneNode(true)
      div.innerText = v.name

      let textCount = 0
      div.addEventListener("click", (e) => {
        document.querySelector(".selected")?.classList.remove("selected")
        li.classList.add("selected")
        // onPostMessage("select-node", {id: v.id, page: v.page})
        parent.postMessage({ pluginMessage: {
          type: "select-node",
          value: {
            id: v.id,
            page: v.page
          }
        } }, "*")
      })
      div.addEventListener("dblclick", (e) => {
        // change the name
        textCount = div.innerText.length
        div.contentEditable = true
        div.focus()
      })
      div.addEventListener("focus", () => {
        document.execCommand('selectAll', false, null)
      })
      div.addEventListener("blur", (e) => {
        // update bookmark
        div.contentEditable = false
        textCount = e.target.innerText.length
        // onPostMessage("update-bookmark", {id: v.id, name: e.target.innerText})
        parent.postMessage({ pluginMessage: {
          type: "update-bookmark",
          value: {
            id: v.id,
            name: e.target.innerText
          }
        } }, "*")
      })
      div.addEventListener("keyup", (e) => {
        if(e.key === "Enter" && div.innerText.indexOf('\n') !== -1) {
          // no line breaks
          div.innerText = div.innerText.replaceAll('\n', '')
          div.blur()
          return
        }
        textCount = e.target.innerText.length
        if(e.key === "Enter" || e.key === "Backspace") return
        if(e.target.innerText.length == MAX_TEXT_LENGTH) {
          div.blur()
        }
      })
      li.appendChild(div)

      const deleteButton = e_button.cloneNode(true)
      deleteButton.onclick = (() => {
        // onPostMessage("delete-bookmark", {id: v.id})
        parent.postMessage({ pluginMessage: {
          type: "delete-bookmark",
          value: {
            id: v.id
          }
        } }, "*")
      })
      li.appendChild(deleteButton)

      listWrapper.appendChild(li)
    });

    let dragId = ""
    document.querySelectorAll('.figmark-list li').forEach ((elm: any) => {
      elm.ondragstart = function () {
        dragId = elm.id
      };
      elm.ondragover = function (event) {
        event.preventDefault();
        let rect = this.getBoundingClientRect();
        if ((event.clientY - rect.top) < (this.clientHeight / 2)) {
          //マウスカーソルの位置が要素の半分より上
          this.style.borderTop = '2px solid black';
          this.style.borderBottom = '';
        } else {
          //マウスカーソルの位置が要素の半分より下
          this.style.borderTop = '';
          this.style.borderBottom = '2px solid black';
        }
      };
      elm.ondragleave = function () {
        this.style.borderTop = '';
        this.style.borderBottom = '';
      };
      elm.ondrop = function (event) {
        event.preventDefault();
        let elm_drag = document.getElementById(dragId);

        let rect = this.getBoundingClientRect();
        if ((event.clientY - rect.top) < (this.clientHeight / 2)) {
          //マウスカーソルの位置が要素の半分より上
          this.parentNode.insertBefore(elm_drag, this);
        } else {
          //マウスカーソルの位置が要素の半分より下
          this.parentNode.insertBefore(elm_drag, this.nextSibling);
        }
        this.style.borderTop = '';
        this.style.borderBottom = '';
        dragId = '';
      };
    });
  }
}