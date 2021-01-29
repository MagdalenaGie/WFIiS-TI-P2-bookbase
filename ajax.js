$(document).ready(function() {

    $("#login_form").on("submit", function( event ) {
        event.preventDefault();
        let data={
            login:$('#login').val(),
            pass: $('#pass').val(),
        }

        $.ajax({
            type: "POST",
            url: "/login",
            data: data,
            success: function(response) {
                alert(response);
            },
            error: function(response) {
                alert(response.responseText);
            }
        })
    });

    $("#register_form").on("submit", function( event ) {
        event.preventDefault();
        let data={
            login:$('#loginreg').val(),
            pass1: $('#pass1').val(),
            pass2: $('#pass2').val()
        }
        console.log(data)
        if(!data.pass1 || !data.pass2 || !data.login){
            alert("Aby się zarejestrować musisz wypełnić wszystkie pola!")
        }else if( data.pass1 !== data.pass2){
            alert("Niestety, wartości które wprowadziłeś w polu na hasło nie zgadzają się ze sobą - aby zatwierdzić formularz i założyć konto, dane muszą być identyczne!")
        }else{
            let dataToSend = {
                login: data.login,
                pass: data.pass1
            }
            $.ajax({
                type: "POST",
                url: "/register",
                data: dataToSend,
                success: function(response) {
                    alert(response);
                },
                error: function(response) {
                    alert(response.responseText);
                }
            })
        }
    });

    $("#add_book").on("submit", function( event ) {
        event.preventDefault();
        console.log("In post book!");
        let data={
            title:$('#title').val(),
            author:$('#author').val(),
            done:$('#done').val(),
            category:$('#category').val()
        }
        console.log(data)
        $.ajax({
            type: "POST",
            url: "/addbook",
            data: data,
            success: function(response) {
                console.log("Dodano książkę!")
                alert(response);
            },
            error: function(response) {
                alert(response.responseText);
            }
        })
    });

    $('#pushtodb').on("click", function(event){
        event.preventDefault();
        //get session storage 
        storeString = sessionStorage.getItem('books');
        if(storeString){
            storeObject = JSON.parse(storeString)
            for(let book of storeObject){
                let data={
                    title:book.title,
                    author:book.author,
                    done:book.done,
                    category:book.category
                }
                $.ajax({
                    type: "POST",
                    url: "/addbook",
                    data: data,
                    success: function(response) {
                        console.log("Dodano książkę!")
                    },
                    error: function(response) {
                        alert(response.responseText);
                    }
                })
            }
            sessionStorage.clear();
            alert("Dodaliśmy książki z twojej listy lokalnej do bazy danych!")
        }else{
            alert("Twoja lokalna lista nie zawiera książek, nie ma nic do dodania!")
        }
    })

    $("#makeChart").on("click", function (event){
        $.ajax({
            type: "GET",
            url: "/getmystats",
            success: function(data) {
                console.log(data);
                showStats(data);
            },
            error: function(){
                alert('Nie udalo sie uzyskać danych z serwera.');
            }
        })
    });

    function showStats(data){
        // Question 1
        var barchar = document.getElementById("booktypechart").getContext("2d");
        var donutchar = document.getElementById("donechart").getContext("2d");

        var values01 = ['historyczna', 'fantastyka', 'naukowa', 'romans'];
        var data01 = [0,0,0,0];

        for (var i = 0; i < values01.length; i++){
            for(var j = 0; j < data.length; j++){
                if(data[j].category == values01[i]){
                    data01[i]++;
                }
            }
        }

        console.log(data01);
        var chart01 = new Chart(barchar, {
            type: 'bar',
            data: {
                labels: ['historyczna', 'fantastyka', 'naukowa', 'romans'],
                datasets: [{
                    label: 'Ilość zapisanych książek z danej kategorii',
                    data: data01,
                    backgroundColor: [
                        'rgba(204, 0, 0, 0.5)',
                        'rgba(102, 0, 204, 0.5)',
                        'rgba(0, 0, 204, 0.5)',
                        'rgba(204, 0, 102, 0.5)',
                    ],
                    borderColor: [
                        'rgba(204, 0, 0, 1)',
                        'rgba(102, 0, 204, 1)',
                        'rgba(0, 0, 204, 1)',
                        'rgba(204, 0, 102, 1)',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });

        var values02 = ['przeczytane', 'nieprzeczytane']
        var data02 = [0, 0];

        for(var j = 0; j < data.length; j++){
            if(data[j].done === 'tak'){
                data02[0]++;
            }else if(data[j].done === 'nie'){
                data02[1]++;
            }
        }

        var chart02 = new Chart(donutchar, {
            type: 'doughnut',
            data: {
                labels: ['przeczytane', 'nieprzeczytane'],
                datasets: [{
                    label: 'Porównanie ilosci przeczytanych i nieprzeczytanych książek z twojej bazy',
                    data: data02,
                    backgroundColor: [
                        'rgba(204, 0, 0, 0.5)',
                        'rgba(102, 0, 204, 0.5)',
                    ],
                    borderColor: [
                        'rgba(204, 0, 0, 1)',
                        'rgba(102, 0, 204, 1)',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false
            }
        });
    }
});