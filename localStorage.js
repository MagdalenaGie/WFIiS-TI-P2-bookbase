function saveToLocal(event){
    event.preventDefault();
    storeString = sessionStorage.getItem('books');
    storeObject = JSON.parse(storeString)

    const title = document.querySelector('#ltitle');
    const author = document.querySelector('#lauthor');
    const done = document.querySelector('#ldone');
    const category = document.querySelector('#lcategory');
    let book = {
        title : title.value,
        author : author.value,
        done : done.value,
        category : category.value
    }
    if(storeObject){
            withoutend = storeString.slice(0, -1);
            tab = withoutend + "," + JSON.stringify(book) + "]"
    }else{
        tab="[" + JSON.stringify(book) + "]"
    }

    sessionStorage.setItem('books', tab);
    alert("Książka zapisana w pamięci przeglądarki - po zalogowaniu będziesz mógł ją dodać do bazy danych!")
}
