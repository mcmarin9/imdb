const url = 'https://raw.githubusercontent.com/mcmarin9/imdb/master/imdb_top_1000.json';

const itemsPerPage = 10;
let currentPage = 1;

function showPage(data, page) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const cardsContainer = document.getElementById('card-list');
  cardsContainer.innerHTML = '';

   // Crear un contenedor adicional para uk-grid
  const gridContainer = document.createElement('div');
  gridContainer.className = 'uk-grid uk-child-width-1-2@s';

  for (let i = startIndex; i < endIndex && i < data.length; i++) {
    const movie = data[i];
    const card = document.createElement('div');
    card.className = 'uk-card uk-card-default uk-grid-collapse uk-child-width-1-2@s movie-card';
    card.setAttribute('uk-grid', '');
    card.innerHTML = `
    <div class="uk-card-media-left uk-cover-container">
    <img src="${movie.Poster_Link}" alt="${movie.Series_Title}" uk-image class="movie-image">
        <!-- <canvas width="600" height="400"></canvas>-->
    </div>
    <div>
        <div class="uk-card-body">
            <h3 class="uk-card-title">${movie.Series_Title}</h3>
            <!-- <span class="uk-badge uk-badge-large">${i+1}</span> -->
            <p><span uk-icon="icon: calendar"></span>${movie.Released_Year}</p>
            <p><span uk-icon="icon: star"></span> ${movie.IMDB_Rating} / 10</p>
            <p><span uk-icon="icon: warning"></span> ${movie.Certificate}</p>
            <button class="uk-button uk-button-default" type="button" uk-toggle="target: #more-info-${i}">Ver más</button>

            <div id="more-info-${i}" uk-modal>
               <div class="uk-modal-dialog uk-modal-body">
                    <h2 class="uk-modal-title">Detalles</h2>
                    <p>Duración: ${movie.Runtime}</p>
                    <p>Género: ${movie.Genre}</p>
                    <p>Director: ${movie.Director}</p>
                    <p>Actores: ${movie.Star1}, ${movie.Star2}, ${movie.Star3}, ${movie.Star4}</p>
                    <p>Número de Votos: ${movie.No_of_Votes}</p>
                    <p>Ingresos: ${movie.Gross}</p>
                    <p>Resumen: ${movie.Overview}</p>
                    <p>Meta score: ${movie.Meta_score}</p>
                </div> 
            </div>
        </div>
    </div>
    `;
    cardsContainer.appendChild(card);
  }
}

function updatePagination(data) {
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<a href="#">${i}</a>`;
    listItem.addEventListener('click', () => {
      currentPage = i;
      showPage(data, currentPage);
    });
    paginationContainer.appendChild(listItem);
  }
}

function createBarChart(data, containerId, showTitle) {
  const years = data.map(movie => movie.Released_Year);
  const grossData = data.map(movie => parseFloat(movie.Gross.replace(/,/g, '')));

  const barChartContainer = document.getElementById(containerId);
  const barChart = echarts.init(barChartContainer);

  const option = {
    xAxis: {
      type: 'category',
      data: years
    },
    yAxis: {
      type: 'value',
      name: 'Ingresos',
      nameTextStyle: {
        color: '#333'
      }
    },
    series: [{
      data: grossData,
      type: 'bar'
    }]
  };

  if (showTitle) {
    option.title = {
      text: 'Ingresos por Año',
      textStyle: {
        color: 'white',
        fontSize: 14
      }
    };
  }

  barChart.setOption(option);
}

function createPieChart(data, containerId, showTitle) {
  const years = [...new Set(data.map(movie => movie.Released_Year))];
  const movieCountByYear = years.map(year => {
    return {
      name: year,
      value: data.filter(movie => movie.Released_Year === year).length
    };
  });

  const pieChartContainer = document.getElementById(containerId);
  const pieChart = echarts.init(pieChartContainer);

  const option = {
    series: [{
      type: 'pie',
      radius: '55%',
      data: movieCountByYear
    }]
  };

  if (showTitle) {
    option.title = {
      text: 'Número de Películas por Año',
      textStyle: {
        color: 'white',
        fontSize: 14
      }
    };
  }

  pieChart.setOption(option);
}

let data;

document.addEventListener('DOMContentLoaded', function () {
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(fetchedData => { // Cambia 'data' a 'fetchedData' aquí
      console.log('Datos obtenidos correctamente:', fetchedData);
      data = fetchedData; // Asigna 'fetchedData' a la variable 'data' global aquí
      showPage(data, currentPage);
      updatePagination(data);

      // Después de obtener los datos y actualizar las gráficas, inicializa el offcanvas
      const offcanvas = UIkit.offcanvas('#offcanvas-nav');

      // Asegúrate de que el offcanvas se inicialice después de que el fetch haya tenido éxito
      offcanvas.$el.addEventListener('shown', function () {
        createBarChart(data, 'bar-chart', true);
        createPieChart(data, 'pie-chart', true); 
      });
    })
    .catch(error => {
      console.error('Error al obtener el JSON:', error);
    });
});


document.addEventListener('DOMContentLoaded', (event) => {

  UIkit.util.on('#offcanvas-nav', 'show', function () {
      console.log('offcanvas-nav show');
      document.querySelector('header > :nth-child(2)').classList.add('header-shift');
  });
  
  UIkit.util.on('#offcanvas-nav', 'hide', function () {
      console.log('offcanvas-nav hide');
      document.querySelector('header > :nth-child(2)').classList.remove('header-shift');
  });

  UIkit.util.on('#ingresos-por-anio', 'shown', function() {
    setTimeout(function() {
      createBarChart(data, 'bar-chart-modal', false);
    }, 0);
  });
  
  UIkit.util.on('#peliculas-por-anio', 'shown', function() {
    setTimeout(function() {
      createPieChart(data, 'pie-chart-modal', false);
    }, 0);
  });

});