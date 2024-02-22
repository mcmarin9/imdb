const url = 'https://raw.githubusercontent.com/mcmarin9/imdb/master/imdb_top_1000.json?token=';
const token = 'GHSAT0AAAAAACM545DGZO6D4TC4LPW5BTB6ZOXTX2A';
const urlToken = url + token;

const itemsPerPage = 10;
let currentPage = 1;

function showPage(data, page) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const cardsContainer = document.getElementById('card-list');
  cardsContainer.innerHTML = '';

  for (let i = startIndex; i < endIndex && i < data.length; i++) {
    const movie = data[i];
    const card = document.createElement('div');
    card.className = 'uk-card uk-card-default uk-card-body';
    card.innerHTML = `
    <h3 class="uk-card-title">${movie.Series_Title}</h3>
    <img src="${movie.Poster_Link}" alt="${movie.Series_Title}" style="max-width: 100%; height: auto;">

    <!-- Sección Detalles Básicos -->
    <div class="uk-margin">
    <a href="" uk-icon="icon: calendar"></a> ${movie.Released_Year}</p>
        <p>Puntuación IMDB: ${movie.IMDB_Rating}</p>
        <p>Certificado: ${movie.Certificate}</p>
        <a href="" uk-icon="icon: clock"></a> ${movie.Runtime}
        <p>Género: ${movie.Genre}</p>
        <p>Director: ${movie.Director}</p>
    </div>

    <!-- Sección Elenco -->
    <div class="uk-margin">
        <p>Actores: ${movie.Star1}, ${movie.Star2}, ${movie.Star3}, ${movie.Star4}</p>
    </div>

    <!-- Sección Otros Detalles -->
    <div class="uk-margin">
        <p>Número de Votos: ${movie.No_of_Votes}</p>
        <p>Ingresos: ${movie.Gross}</p>
        <p>Resumen: ${movie.Overview}</p>
        <p>Meta score: ${movie.Meta_score}</p>
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

function createBarChart(data) {
  const years = data.map(movie => movie.Released_Year);
  const grossData = data.map(movie => parseFloat(movie.Gross.replace(/,/g, '')));

  const barChartContainer = document.getElementById('bar-chart');
  const barChart = echarts.init(barChartContainer);

  const option = {
    title: {
      text: 'Ingresos por Año',
      textStyle: {
        color: '#333',
        fontSize: 14
      }
    },
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

  barChart.setOption(option);
}

function createPieChart(data) {
  const years = [...new Set(data.map(movie => movie.Released_Year))];
  const movieCountByYear = years.map(year => {
    return {
      name: year,
      value: data.filter(movie => movie.Released_Year === year).length
    };
  });

  const pieChartContainer = document.getElementById('pie-chart');
  const pieChart = echarts.init(pieChartContainer);

  const option = {
    title: {
      text: 'Número de Películas por Año',
      textStyle: {
        color: '#333',
        fontSize: 14
      }
    },
    series: [{
      type: 'pie',
      radius: '55%',
      data: movieCountByYear
    }]
  };

  pieChart.setOption(option);
}


document.addEventListener('DOMContentLoaded', function () {
  const offcanvas = UIkit.offcanvas('#offcanvas-nav');

  offcanvas.$el.addEventListener('shown', function () {
    fetch(urlToken)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Datos obtenidos correctamente:', data);
        showPage(data, currentPage);
        updatePagination(data);

        // Actualiza las gráficas con los datos después de cargar el JSON
        createBarChart(data);
        createPieChart(data);
      })
      .catch(error => {
        console.error('Error al obtener el JSON:', error);
      });
  });
});