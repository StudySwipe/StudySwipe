export default {
    init(){
        console.log("WebLearn initiated.")
        buildNav();
        addSwipeGestures();
        document.getElementsByClassName("expndnav")[0].addEventListener("click", function(){
            if(nav_expanded){
                document.getElementById("navul").style.display = "none";
                nav_expanded = false;
            }else {
                document.getElementById("navul").style.display = "block";
                nav_expanded = true;
            }
        });

        let level_select = document.getElementsByClassName("level-select");
        if(level_select.length > 0){
            let update_selected_level = function() {
                let selected_level = parseInt(document.querySelector('input[name="level"]:checked').getAttribute("data-level"));

                console.log("Selected level is: " + selected_level);
                update_hash({level: selected_level});

                for(let element of document.getElementsByClassName("level-limited")){
                    console.log(parseInt(element.getAttribute("data-level"))+" <= "+parseInt(selected_level)+"?");
                    if(parseInt(element.getAttribute("data-level"))<=parseInt(selected_level)){
                        element.style.display = "inherit";
                    }else{
                        element.style.display = "none";
                    }
                }
                buildNav();
            }

            let preset_level = load_hash().level;
            if(preset_level){
                document.getElementById("level-"+preset_level).checked = true;
            }

            update_selected_level();

            for(let radio of document.getElementsByName("level")){
                radio.removeEventListener("change", update_selected_level);
                radio.addEventListener("change", update_selected_level);
            }
        }
        prepare_quizzes();
        prepare_imageboxes();
    },
    init_sizer(){
        document.getElementById("marginslider").addEventListener("change", update_margin);
        window.onresize = update_margin;
        update_margin();
    }
}

let prepare_quizzes = function (){
    //Reveal Quizzes
    let reveal_quizzes = document.getElementsByClassName("quiz-reveal");
    for(let quiz of reveal_quizzes){
        quiz.getElementsByClassName("quiz-answer")[0].style.display = "none";
        quiz.getElementsByClassName("quiz-reveal-btn")[0].addEventListener("click", function(){
            this.parentElement.getElementsByClassName("quiz-answer")[0].style.display = "block";
            this.style.display = "none";
        })
    }

    //Cloze Quizzes
    let cloze_quizzes = document.getElementsByClassName("quiz-cloze");
    for(let quiz of cloze_quizzes){
        let clozes = quiz.getElementsByClassName("cloze");
        for(let cloze of clozes){
            let solution = cloze.innerHTML;
            cloze.setAttribute("solution", solution);
            cloze.innerHTML = "[...]";
        }
        quiz.getElementsByClassName("quiz-reveal-btn")[0].addEventListener("click", function(){
            let clozes = this.parentElement.getElementsByClassName("cloze");
            for(let cloze of clozes){
                cloze.innerHTML = cloze.getAttribute("solution");
            }
            this.style.display = "none";
        })
    }

    //Single Choice Quizzes
    let sc_quizzes = document.getElementsByClassName("quiz-single-choice");
    for(let quiz of sc_quizzes){
        quiz.getElementsByClassName("quiz-reveal-btn")[0].addEventListener("click", function(){
            for(let radio of this.parentElement.querySelectorAll("input")){
                if(radio.getAttribute("data-correct") === "true"){
                    if(radio.checked){
                        //Correct answer was ticket
                        this.parentElement.getElementsByClassName("quiz-answers")[0].style.backgroundColor = "#f3fedb";
                    }else{
                        radio.parentElement.style.backgroundColor = "#f3fedb";
                        this.parentElement.getElementsByClassName("quiz-answers")[0].style.backgroundColor = "#ffe9df";
                    }
                }
                radio.disabled = true;
            }
            this.style.display = "none";
        })
    }

    //Multiple Choice Quizzes
    let mc_quizzes = document.getElementsByClassName("quiz-multiple-choice");
    for(let quiz of mc_quizzes){
        quiz.getElementsByClassName("quiz-reveal-btn")[0].addEventListener("click", function(){
            for(let checkbox of this.parentElement.querySelectorAll("input")){
                if((checkbox.getAttribute("data-correct") === "true" && checkbox.checked)){
                        checkbox.style.outline = "#00ff00 dashed 3px";
                        checkbox.style.outlineOffset = "1px"
                }else if((checkbox.getAttribute("data-correct") === "false" && checkbox.checked) || (checkbox.getAttribute("data-correct") === "true" && !checkbox.checked)){
                    checkbox.style.outline = "red dashed 3px";
                    checkbox.style.outlineOffset = "1px"
                }
                checkbox.disabled = true;
            }
            this.style.display = "none";
        });
    }

    let kb_quizzes = document.getElementsByClassName("quiz-keyboard");
    let check_answer = function(input){
        let correct_answer = input.getAttribute("data-answer").toLowerCase();
        let given_answer = input.value.toLowerCase();

        if(correct_answer === given_answer || correct_answer === given_answer.replaceAll(" ", "")){
            input.style.backgroundColor = "lime";
        }else{
            input.style.backgroundColor = "red";
        }
    }
    for(let quiz of kb_quizzes){

        quiz.getElementsByClassName("quiz-keyboard-input")[0].onkeypress = function(e){
            var keyCode = e.code || e.key;
            if (keyCode === 'Enter'){
                check_answer(quiz.getElementsByClassName("quiz-keyboard-input")[0]);
            }
        }
        quiz.getElementsByClassName("quiz-reveal-btn")[0].onclick = function(){
            check_answer(quiz.getElementsByClassName("quiz-keyboard-input")[0]);
        };
    }

}

let prepare_imageboxes = function(){
    let figures = document.getElementsByTagName("figure");
    for(let figure of figures){
        figure.addEventListener("click", toggle_figure_zoom);
    }
}

let toggle_figure_zoom = function(){
    let imagebox = this;
    let images = imagebox.querySelectorAll("img");
    let image = images[0].cloneNode(true);
    let current_image = 0;

    image.style.width = null;
    image.style.maxWidth = null;
    image.style.height = null;
    image.style.maxHeight = null;

    let zoombox = "<div class='zoombox'><div class='zoombox-images'>"+image.outerHTML+"</div>";

    console.log(imagebox.getElementsByTagName("figcaption"));
    if(imagebox.getElementsByTagName("figcaption").length > 0){
        let img_description = imagebox.getElementsByTagName("figcaption")[0].innerHTML;
        zoombox += "<div class='zoombox-description'><p>"+img_description+"</p></div>"
    }

    zoombox += "<div class='zoombox-controls'><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" fill=\"currentColor\" class=\"bi bi-x-lg zoombox-control-close\" viewBox=\"0 0 16 16\">\n" +
        "  <path d=\"M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z\"/>\n" +
        "</svg>";

    if(images.length > 1){
        zoombox += "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" fill=\"currentColor\" class=\"bi bi-layer-forward zoombox-control-layer-up\" viewBox=\"0 0 16 16\">\n" +
        "  <path d=\"M8.354.146a.5.5 0 0 0-.708 0l-3 3a.5.5 0 0 0 0 .708l1 1a.5.5 0 0 0 .708 0L7 4.207V12H1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H9V4.207l.646.647a.5.5 0 0 0 .708 0l1-1a.5.5 0 0 0 0-.708l-3-3z\"/>\n" +
        "  <path d=\"M1 7a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h4.5a.5.5 0 0 0 0-1H1V8h4.5a.5.5 0 0 0 0-1H1zm9.5 0a.5.5 0 0 0 0 1H15v2h-4.5a.5.5 0 0 0 0 1H15a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-4.5z\"/>\n" +
        "</svg>" +
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" fill=\"currentColor\" class=\"bi bi-layer-backward zoombox-control-layer-down\" viewBox=\"0 0 16 16\">\n" +
        "  <path d=\"M8.354 15.854a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708l1-1a.5.5 0 0 1 .708 0l.646.647V4H1a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9v7.793l.646-.647a.5.5 0 0 1 .708 0l1 1a.5.5 0 0 1 0 .708l-3 3z\"/>\n" +
        "  <path d=\"M1 9a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4.5a.5.5 0 0 1 0 1H1v2h4.5a.5.5 0 0 1 0 1H1zm9.5 0a.5.5 0 0 1 0-1H15V6h-4.5a.5.5 0 0 1 0-1H15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4.5z\"/>\n" +
        "</svg>"
    }
    zoombox += "</div></div>"
    document.body.insertAdjacentHTML('beforeend', zoombox);

    if(images.length > 1){
        document.getElementsByClassName('zoombox-control-layer-down')[0].classList.add("zoombox-control-disabled");
        document.getElementsByClassName("zoombox-control-layer-up")[0].addEventListener("click", function(){
            if(current_image<images.length-1){
                current_image = current_image+1;
                let newimage = images[current_image].cloneNode(true);
                newimage.style.height = null;
                newimage.style.width = null;
                newimage.style.display = "block";
                document.getElementsByClassName("zoombox-images")[0].innerHTML += newimage.outerHTML;
                if(current_image===images.length-1){
                    document.getElementsByClassName('zoombox-control-layer-up')[0].classList.add("zoombox-control-disabled");
                }
                if(current_image>0){
                    document.getElementsByClassName('zoombox-control-layer-down')[0].classList.remove("zoombox-control-disabled");
                }
            }
        })
        document.getElementsByClassName("zoombox-control-layer-down")[0].addEventListener("click", function(){
            if(current_image>0){
                current_image = current_image-1;
                let imagelayers = document.querySelectorAll(".zoombox-images > .imagelayer");
                imagelayers[imagelayers.length-1].remove();

                if(current_image<images.length-1){
                    document.getElementsByClassName('zoombox-control-layer-up')[0].classList.remove("zoombox-control-disabled");
                }
                if(current_image===0){
                    document.getElementsByClassName('zoombox-control-layer-down')[0].classList.add("zoombox-control-disabled");
                }
            }
        })
    }

    document.getElementsByClassName("zoombox-control-close")[0].addEventListener("click", function(){
        document.getElementsByClassName("zoombox")[0].remove();
    })
}

let nav_expanded = false;
let selected_level = Number.MAX_SAFE_INTEGER;
let load_hash = function(){
    let full_hash = window.location.hash.substring(1).split("&");
    let result = {};

    for(let str of full_hash){
        if(str.startsWith("section=")){
            result.section = str.replace("section=", "");
        }
        if(str.startsWith("level=")){
            result.level = str.replace("level=", "");
        }
    }
    return result;
};
let update_hash = function(input){
    let old = load_hash();
    let new_hash = "#";

    if(input.section){
        new_hash += "&section="+input.section;
    }else if(old.section){
        new_hash += "&section="+old.section;
    }

    if(input.level){
        new_hash += "&level="+input.level;
    }else if(old.level){
        new_hash += "&level="+old.level;
    }

    window.location.hash = new_hash;
}

let nav = {
    entries : [],
    active : null,
    /// Reads active page from hash value (e.g. example.html#/first-page)
    set_active : function(){
        let hash_res = load_hash();
        if(hash_res.section){
            nav.active = hash_res.section;
            console.log("Info: Set active page to: "+nav.active);
        }else if(nav.entries.length > 0){
            nav.active = nav.entries[0].id;
            console.log("Info: Set active page to: "+nav.active);
        }else{
            console.error("Error: No pages found to set active page to.");
        }
        loadPage(nav.active);
        set_progressbar(nav.active);
    },
    nav_forward : function(){
        for(let i=0;i<this.entries.length;i++){
            if(this.entries[i].id === this.active){
                if(i+1<this.entries.length){
                    update_hash({section : this.entries[i+1].id})
                    this.set_active();
                    break;
                }
            }
        }
    },
    nav_backward : function(){
        for(let i=this.entries.length-1;i>0;i--){
            if(this.entries[i].id === this.active){
                if(i-1>=0){
                    update_hash({section : this.entries[i-1].id})
                    this.set_active();
                    break;
                }
            }
        }
    }
}

let buildNav = function(){
    let pages = document.querySelectorAll(".weblearn > .pages > section");
    nav.entries = [];
    document.getElementById("navul").innerHTML = "";

    for(let page of pages){
        if(page.hasAttribute("data-level")){
            if(selected_level < parseInt(page.getAttribute("data-level"))){
                continue;
            }
        }
        let title = page.querySelector("h1") ? page.querySelector("h1").textContent : null;
        let subpages = page.querySelectorAll("section");

        if(subpages.length === 0) {
            if (title && page.id) {
                nav.entries.push({id: page.id, title: title});

                let node = "<a class='navlink' href='#/" + page.id + "'>" + title + "</a>";
                document.getElementById("navul").innerHTML += node;
            }
        }

        for(let subpage of subpages){
            if(subpage.hasAttribute("data-level")){
                if(selected_level < parseInt(subpage.getAttribute("data-level"))){
                    continue;
                }
            }

            let title = subpage.querySelector("h1") ? page.querySelector("h1").textContent : null;
            nav.entries.push({id: subpage.id, title: title});

            if(title){
                let node = "<a class='navlink' href='#/" + subpage.id + "'>" + title + "</a>";
                document.getElementById("navul").innerHTML += node;
            }
        }
    }

    nav.set_active();

    window.addEventListener('hashchange', () => {
        nav.set_active();
    }, false);

    document.getElementById("navul").addEventListener("click", function(){
        document.getElementById("navul").style.display = "none";
        nav_expanded = false;
    })
}

let loadPage = function(id){
    let all_pages = document.querySelectorAll("section");

    for(let i=0; i<all_pages.length;i++){
        all_pages[i].style.display = "none";
    }
    let page = document.getElementById(id);

    let page_and_parents = [];
    while(page.parentNode && page.parentNode.nodeName.toLowerCase() !== 'body'){
        page_and_parents.push(page);
        page = page.parentNode;
    }
    for(let page of page_and_parents){
        page.style.display="block";
    }

    let input = page.getElementsByClassName("quiz-keyboard-input");
    if(input.length > 0){
        input[0].focus();
    }
}

var initialX = null;
var initialY = null;

let addSwipeGestures = function(){
    function startTouch(e) {
        initialX = e.touches[0].clientX;
        initialY = e.touches[0].clientY;
    }

    function moveTouch(e) {
        if (initialX === null) {
            return;
        }

        if (initialY === null) {
            return;
        }

        var currentX = e.touches[0].clientX;
        var currentY = e.touches[0].clientY;

        var diffX = initialX - currentX;
        var diffY = initialY - currentY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 5) {
            // sliding horizontally
            if (diffX > 0) {
                // swiped left
                nav.nav_forward();
                console.log("swiped left");
            } else {
                nav.nav_backward();
                console.log("swiped right");
            }
        }

        initialX = null;
        initialY = null;
    }
    document.getElementsByClassName("weblearn")[0].addEventListener("touchstart", startTouch, false);
    document.getElementsByClassName("weblearn")[0].addEventListener("touchmove", moveTouch, false);
    document.onkeydown = function(e) {
        if(e.key === "ArrowRight"){
            nav.nav_forward();
        }
        if(e.key === "ArrowLeft"){
            nav.nav_backward();
        }
    };
}

let update_margin = function(){
    console.log("Initialising Sizer");
    let current_width = window.outerWidth;
    let selected_percentage = document.getElementById("marginslider").value;
    let new_width = current_width*(selected_percentage/100);
    console.log("Setting margin to match selected percentage of "+selected_percentage+"% resulting in a new width of "+new_width+". Total width was "+current_width);
    if(current_width>=1000){
        document.getElementsByClassName("weblearn")[0].setAttribute("style", "width: "+new_width+"px !important");
    }else{
        document.getElementsByClassName("weblearn")[0].removeAttribute("style");
    }
}

let set_progressbar = function(id){
    let page_num = 1;
    for(page_num;page_num<=nav.entries.length;page_num++){
        if(nav.entries[page_num-1].id === id){
            break;
        }
    }
    let percent = (page_num/nav.entries.length)*100;
    console.log("Setting progressbar to "+percent+" %.");
    document.getElementById("progressbar").setAttribute("value", percent);
}