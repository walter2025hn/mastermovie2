import { MovieStream, SeriesStream, MediaCategory } from '../types';

export const MOCK_CATEGORIES: MediaCategory[] = [
  { category_id: "all", category_name: "Todas las Categorías" },
  { category_id: "1", category_name: "Estrenos 2024 - 2025" },
  { category_id: "4", category_name: "Terror / Horror 👻" },
  { category_id: "8", category_name: "Suspenso / Thriller 🔍" },
  { category_id: "2", category_name: "Acción & Aventura 💥" },
  { category_id: "3", category_name: "Ciencia Ficción 🚀" },
  { category_id: "5", category_name: "Comedia 😂" },
  { category_id: "6", category_name: "Drama & Emoción 🎭" },
  { category_id: "7", category_name: "Animación & Familia 🍿" }
];

export const MOCK_SERIES_CATEGORIES: MediaCategory[] = [
  { category_id: "all", category_name: "Todas las Series" },
  { category_id: "s1", category_name: "Series Estreno 2024 - 2025" },
  { category_id: "s3", category_name: "Series de Terror 👻" },
  { category_id: "s2", category_name: "Series de Suspenso & Thriller 🔍" },
  { category_id: "s4", category_name: "Ciencia Ficción & Fantasía 🚀" },
  { category_id: "s5", category_name: "Acción & Aventura 💥" },
  { category_id: "s6", category_name: "Drama & Crimen 🎭" },
  { category_id: "s7", category_name: "Comedia & Sitcoms 😂" },
  { category_id: "s8", category_name: "Animación & Anime 🍿" }
];

// Rich base movies catalog with accurate years and specific genres
export function generateMockMovies(): MovieStream[] {
  const baseMovies = [
    // Terror / Horror
    {
      title: "Alien: Romulus (2024)",
      cat: "4",
      year: "2024",
      genre: "Terror, Ciencia Ficción, Suspenso",
      rating: 7.6,
      poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
      plot: "Un grupo de jóvenes colonizadores espaciales se enfrenta a la forma de vida más aterradora del universo en una estación abandonada."
    },
    {
      title: "El Conjuro 3: El Diablo me Obligó a Hacerlo (2021)",
      cat: "4",
      year: "2021",
      genre: "Terror, Misterio, Paranormal",
      rating: 7.2,
      poster: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&auto=format&fit=crop&q=80",
      plot: "Ed y Lorraine Warren investigan una posesión demoníaca que desató un escalofriante caso judicial por homicidio."
    },
    {
      title: "Sonríe 2 (2024)",
      cat: "4",
      year: "2024",
      genre: "Terror, Suspenso psicológico",
      rating: 7.3,
      poster: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&auto=format&fit=crop&q=80",
      plot: "Una estrella del pop mundial empieza a experimentar sucesos aterradores e inexplicables justo antes de iniciar una gira mundial."
    },
    {
      title: "Un Lugar en Silencio: Día Uno (2024)",
      cat: "4",
      year: "2024",
      genre: "Terror, Suspenso, Ciencia Ficción",
      rating: 7.1,
      poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80",
      plot: "La ciudad de Nueva York sufre la invasión de criaturas alienígenas ciegas que cazan guiadas por el más mínimo sonido."
    },
    {
      title: "Scream VI (2023)",
      cat: "4",
      year: "2023",
      genre: "Terror, Slasher, Misterio",
      rating: 7.0,
      poster: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=500&auto=format&fit=crop&q=80",
      plot: "Los supervivientes de los asesinatos de Woodsboro se trasladan a Nueva York, pero Ghostface no tardará en reaparecer."
    },
    {
      title: "El Exorcista (1973) - Clásico",
      cat: "4",
      year: "1973",
      genre: "Terror clásico, Posesión, Sobrenatural",
      rating: 8.5,
      poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80",
      plot: "Una niña de doce años es víctima de fenómenos paranormales que obligan a su madre a recurrir a dos sacerdotes para un exorcismo."
    },

    // Suspenso / Thriller
    {
      title: "La Trampa (Trap) (2024)",
      cat: "8",
      year: "2024",
      genre: "Suspenso, Thriller psicológico, Crimen",
      rating: 6.8,
      poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80",
      plot: "Un padre lleva a su hija a un concierto pop, sin saber que el evento es una trampa policial para capturar a un asesino en serie."
    },
    {
      title: "Oppenheimer (2023)",
      cat: "8",
      year: "2023",
      genre: "Suspenso, Drama histórico, Biografía",
      rating: 8.9,
      poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&auto=format&fit=crop&q=80",
      plot: "La intensa historia del físico J. Robert Oppenheimer y su liderazgo en el Proyecto Manhattan que cambió el destino humano."
    },
    {
      title: "Perdida (Gone Girl) (2014)",
      cat: "8",
      year: "2014",
      genre: "Suspenso, Misterio, Crimen",
      rating: 8.2,
      poster: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=500&auto=format&fit=crop&q=80",
      plot: "En el día de su quinto aniversario de bodas, un hombre descubre que su esposa ha desaparecido y las sospechas recaen sobre él."
    },
    {
      title: "Seven: Pecados Capitales (1995)",
      cat: "8",
      year: "1995",
      genre: "Suspenso, Thriller policial, Crimen",
      rating: 8.6,
      poster: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=500&auto=format&fit=crop&q=80",
      plot: "Dos detectives siguen la pista de un meticuloso asesino en serie cuyos crímenes se basan en los siete pecados capitales."
    },
    {
      title: "El Origen (Inception) (2010)",
      cat: "8",
      year: "2010",
      genre: "Suspenso, Ciencia Ficción, Acción",
      rating: 8.8,
      poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80",
      plot: "Un ladrón con la habilidad de infiltrarse en los sueños para robar secretos debe realizar la tarea inversa: implantar una idea."
    },

    // Acción / Ciencia Ficción / Éxitos
    {
      title: "Dune: Parte Dos (2024)",
      cat: "3",
      year: "2024",
      genre: "Ciencia Ficción, Aventura, Acción",
      rating: 8.6,
      poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80",
      plot: "Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia."
    },
    {
      title: "Deadpool & Wolverine (2024)",
      cat: "2",
      year: "2024",
      genre: "Acción, Comedia, Superhéroes",
      rating: 8.1,
      poster: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80",
      plot: "Wade Wilson regresa y debe unir fuerzas con un reticente Wolverine para salvar su universo de una amenaza colosal."
    },
    {
      title: "Furiosa: Saga Mad Max (2024)",
      cat: "2",
      year: "2024",
      genre: "Acción, Aventura, Post-apocalíptico",
      rating: 7.8,
      poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80",
      plot: "La joven Furiosa es arrebatada del Lugar Verde de Muchas Madres y cae en manos de una gran Horda de Motoristas."
    },
    {
      title: "Spider-Man: A través del Spider-Verso (2023)",
      cat: "7",
      year: "2023",
      genre: "Animación, Acción, Ciencia Ficción",
      rating: 8.7,
      poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&auto=format&fit=crop&q=80",
      plot: "Miles Morales es catapultado a través del Multiverso, donde se encuentra con un equipo de Spider-People encargado de protegerlo."
    },
    {
      title: "Intensa-Mente 2 (2024)",
      cat: "7",
      year: "2024",
      genre: "Animación, Comedia, Familia",
      rating: 8.0,
      poster: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=80",
      plot: "La sede central de la mente de Riley sufre una repentina demolición para hacer espacio a algo totalmente inesperado: Ansiedad."
    },
    {
      title: "El Caballero de la Noche (2008)",
      cat: "2",
      year: "2008",
      genre: "Acción, Crimen, Suspenso",
      rating: 9.0,
      poster: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=500&auto=format&fit=crop&q=80",
      plot: "Cuando la amenaza conocida como el Guasón causa caos en Gotham, Batman debe aceptar una de las mayores pruebas de su heroísmo."
    },
    {
      title: "Interestelar (2014)",
      cat: "3",
      year: "2014",
      genre: "Ciencia Ficción, Drama, Aventura",
      rating: 8.7,
      poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80",
      plot: "Un equipo de exploradores viaja a través de un agujero de gusano en el espacio en un intento por asegurar la supervivencia de la humanidad."
    },
    {
      title: "Avatar: El Sentido del Agua (2022)",
      cat: "3",
      year: "2022",
      genre: "Ciencia Ficción, Acción, Aventura",
      rating: 7.7,
      poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80",
      plot: "Jake Sully vive con su nueva familia en Pandora, pero cuando una amenaza familiar regresa, debe emprender una dura batalla con el pueblo Na'vi."
    },
    {
      title: "Pulp Fiction (1994) - Clásico",
      cat: "8",
      year: "1994",
      genre: "Crimen, Suspenso, Drama",
      rating: 8.9,
      poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=80",
      plot: "Las vidas de dos sicarios de la mafia, un boxeador, la esposa de un gángster y dos bandidos se entrelazan en cuatro historias de violencia."
    }
  ];

  const movies: MovieStream[] = [];
  // Generate 180 movies distributed across years and genres for 60-en-60 pagination testing
  for (let i = 0; i < 180; i++) {
    const base = baseMovies[i % baseMovies.length];
    const streamId = 1000 + i;
    const vol = Math.floor(i / baseMovies.length);
    movies.push({
      stream_id: streamId,
      name: vol === 0 ? base.title : `${base.title} (Edición ${vol + 1})`,
      category_id: base.cat,
      stream_icon: base.poster,
      rating: base.rating,
      rating_5based: Math.round((base.rating / 2) * 10) / 10,
      container_extension: "mp4",
      year: base.year,
      genre: base.genre,
      plot: base.plot,
      director: "Director Cinemático",
      cast: "Actor Principal, Co-protagonista, Estrella Invitada",
      duration: "1h 58m"
    });
  }
  return movies;
}

export function generateMockSeries(): SeriesStream[] {
  const baseSeries = [
    // --- SERIES DE TERROR / HORROR ---
    {
      title: "Stranger Things (2016)",
      cat: "s3",
      rating: 8.7,
      cover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80",
      year: "2016",
      release_date: "2016-07-15",
      genre: "Terror, Misterio, Ciencia Ficción, Sobrenatural",
      plot: "Cuando un niño desaparece, sus amigos, la familia y la policía se ven envueltos en un misterio que involucra experimentos secretos, fuerzas sobrenaturales y una niña muy extraña."
    },
    {
      title: "From (2022)",
      cat: "s3",
      rating: 8.0,
      cover: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&auto=format&fit=crop&q=80",
      year: "2022",
      release_date: "2022-02-20",
      genre: "Terror, Suspenso, Misterio, Paranormal",
      plot: "Un pueblo de pesadilla en el centro de Norteamérica atrapa a todos los que entran. Los residentes luchan por mantener la cordura y sobrevivir a las aterradoras criaturas del bosque circundante."
    },
    {
      title: "The Last of Us (2023)",
      cat: "s3",
      rating: 8.8,
      cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
      year: "2023",
      release_date: "2023-01-15",
      genre: "Terror, Suspenso, Drama post-apocalíptico, Zombie",
      plot: "Veinte años después de que una infección por hongos arrase el planeta, Joel es contratado para sacar de contrabando a Ellie, una niña de 14 años que podría ser la clave para la cura."
    },
    {
      title: "La Maldición de Hill House (2018)",
      cat: "s3",
      rating: 8.6,
      cover: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&auto=format&fit=crop&q=80",
      year: "2018",
      release_date: "2018-10-12",
      genre: "Terror psicológico, Horror, Sobrenatural, Fantasmas",
      plot: "Un grupo de hermanos que crecieron en lo que luego se convertiría en la casa embrujada más famosa del país deben enfrentarse a los fantasmas del pasado."
    },
    {
      title: "The Walking Dead: Daryl Dixon (2023)",
      cat: "s3",
      rating: 7.6,
      cover: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80",
      year: "2023",
      release_date: "2023-09-10",
      genre: "Terror, Apocalipsis Zombie, Acción",
      plot: "Daryl Dixon llega a la costa de Francia y lucha por reconstruir cómo llegó allí y por qué, mientras busca la manera de regresar a casa."
    },
    {
      title: "American Horror Story: Delicate (2023)",
      cat: "s3",
      rating: 7.7,
      cover: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=500&auto=format&fit=crop&q=80",
      year: "2023",
      release_date: "2023-09-20",
      genre: "Terror, Siniestro, Misterio, Ocultismo",
      plot: "Una actriz está convencida de que una figura siniestra está haciendo todo lo posible para asegurarse de que su embarazo nunca suceda."
    },
    {
      title: "Chucky: La Serie (2021)",
      cat: "s3",
      rating: 7.3,
      cover: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&auto=format&fit=crop&q=80",
      year: "2021",
      release_date: "2021-10-12",
      genre: "Terror, Slasher, Humor negro",
      plot: "Un muñeco Chucky vintage aparece en una venta de garaje suburbana, y una idílica ciudad estadounidense se sume en el caos con una serie de crímenes aterradores."
    },
    {
      title: "Misa de Medianoche (Midnight Mass) (2021)",
      cat: "s3",
      rating: 7.7,
      cover: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80",
      year: "2021",
      release_date: "2021-09-24",
      genre: "Terror religioso, Suspenso sobrenatural, Vampiros",
      plot: "La llegada de un joven y carismático sacerdote trae milagros gloriosos y presagios aterradores a una comunidad isleña en declive."
    },

    // --- SERIES DE SUSPENSO / THRILLER / CRIMEN ---
    {
      title: "El Pingüino (2024)",
      cat: "s2",
      rating: 8.8,
      cover: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=500&auto=format&fit=crop&q=80",
      year: "2024",
      release_date: "2024-09-19",
      genre: "Suspenso, Crimen, Mafia, Thriller psicológico",
      plot: "Oswald Cobblepot emprende su implacable ascenso al poder en el inframundo criminal de Gotham tras el caos dejado tras la caída de Carmine Falcone."
    },
    {
      title: "Severance (Separación) (2022)",
      cat: "s2",
      rating: 8.7,
      cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80",
      year: "2022",
      release_date: "2022-02-18",
      genre: "Suspenso psicológico, Misterio, Ciencia Ficción",
      plot: "Mark lidera un equipo de empleados cuyos recuerdos han sido divididos quirúrgicamente entre su vida laboral y personal, ocultando conspiraciones inquietantes."
    },
    {
      title: "True Detective: Tierra Nocturna (2024)",
      cat: "s2",
      rating: 7.9,
      cover: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80",
      year: "2024",
      release_date: "2024-01-14",
      genre: "Suspenso, Misterio policial, Detective, Crimen",
      plot: "Cuando la larga noche de invierno cae en Ennis, Alaska, los hombres que operan la Estación de Investigación del Ártico Tsalal desaparecen sin dejar rastro."
    },
    {
      title: "Silo (2023)",
      cat: "s2",
      rating: 8.1,
      cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80",
      year: "2023",
      release_date: "2023-05-05",
      genre: "Suspenso, Distopía, Intriga, Misterio",
      plot: "En un futuro en ruinas y tóxico, una comunidad vive en un silo subterráneo gigante que se sumerge a cientos de pisos de profundidad con normas estrictas."
    },
    {
      title: "Bebé Reno (Baby Reindeer) (2024)",
      cat: "s2",
      rating: 7.9,
      cover: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&auto=format&fit=crop&q=80",
      year: "2024",
      release_date: "2024-04-11",
      genre: "Suspenso psicológico, Drama, Acoso real",
      plot: "Un comediante en apuros realiza un acto de bondad hacia una mujer vulnerable, desatando una obsesión sofocante que amenaza con destruir sus vidas."
    },
    {
      title: "Presunto Inocente (Presumed Innocent) (2024)",
      cat: "s2",
      rating: 7.8,
      cover: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=500&auto=format&fit=crop&q=80",
      year: "2024",
      release_date: "2024-06-12",
      genre: "Suspenso judicial, Crimen, Intriga, Misterio",
      plot: "Un horrible asesinato da un vuelco a la fiscalía de Chicago cuando uno de los suyos es sospechoso del crimen."
    },
    {
      title: "Ripley (2024)",
      cat: "s2",
      rating: 8.1,
      cover: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=80",
      year: "2024",
      release_date: "2024-04-04",
      genre: "Suspenso, Thriller psicológico, Crimen noir",
      plot: "A principios de los años 60 en Nueva York, Tom Ripley es contratado por un hombre rico para viajar a Italia y convencer a su hijo vagabundo de regresar a casa."
    },
    {
      title: "Mindhunter (2017)",
      cat: "s2",
      rating: 8.6,
      cover: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&auto=format&fit=crop&q=80",
      year: "2017",
      release_date: "2017-10-13",
      genre: "Suspenso psicológico, Crimen, Asesinos en serie, FBI",
      plot: "A finales de la década de 1970, dos agentes del FBI amplían las fronteras de la ciencia criminal investigando la psicología de los asesinos seriales."
    },
    {
      title: "Dark (2017)",
      cat: "s2",
      rating: 8.7,
      cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80",
      year: "2017",
      release_date: "2017-12-01",
      genre: "Suspenso, Misterio, Ciencia Ficción, Viajes en el tiempo",
      plot: "La desaparición de dos niños en la ciudad alemana de Winden desvela las dobles vidas y las relaciones rotas entre cuatro familias vinculadas por generaciones."
    },
    {
      title: "Breaking Bad (2008) - Clásico",
      cat: "s2",
      rating: 9.5,
      cover: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=500&auto=format&fit=crop&q=80",
      year: "2008",
      release_date: "2008-01-20",
      genre: "Suspenso, Crimen, Drama magistral",
      plot: "Un profesor de química de secundaria diagnosticado con cáncer pulmonar inoperable se asocia con un exalumno para fabricar y vender metanfetamina."
    },

    // --- ACCIÓN, CIENCIA FICCIÓN & OTROS GÉNEROS ---
    {
      title: "Shogun (2024)",
      cat: "s1",
      rating: 9.1,
      cover: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop&q=80",
      year: "2024",
      release_date: "2024-02-27",
      genre: "Drama histórico, Aventura, Acción samurái",
      plot: "En el Japón feudal de 1600, Lord Yoshii Toranaga lucha por su vida cuando sus enemigos en el Consejo de Regentes se unen en su contra."
    },
    {
      title: "Fallout (2024)",
      cat: "s4",
      rating: 8.5,
      cover: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80",
      year: "2024",
      release_date: "2024-04-10",
      genre: "Ciencia Ficción, Acción, Post-apocalíptico",
      plot: "En un futuro post-apocalíptico devastado por la guerra nuclear, los residentes de lujosos refugios atómicos se ven obligados a regresar a la superficie."
    },
    {
      title: "La Casa del Dragón (2024)",
      cat: "s4",
      rating: 8.5,
      cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
      year: "2024",
      release_date: "2024-06-16",
      genre: "Fantasía, Drama, Dragones, Épica",
      plot: "La sangrienta guerra civil Targaryen conocida como la Danza de los Dragones comienza en Poniente entre los partidarios de Rhaenyra y Aegon II."
    },
    {
      title: "El Problema de los 3 Cuerpos (2024)",
      cat: "s4",
      rating: 7.7,
      cover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80",
      year: "2024",
      release_date: "2024-03-21",
      genre: "Ciencia Ficción, Misterio, Extraterrestres",
      plot: "Una decisión fatídica tomada en la China de los años 60 resuena a través del tiempo y el espacio obligando a un grupo de científicos brillantes a actuar."
    },
    {
      title: "Arcane: League of Legends (2021)",
      cat: "s8",
      rating: 9.0,
      cover: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=80",
      year: "2021",
      release_date: "2021-11-06",
      genre: "Animación, Acción, Ciencia Ficción, Aventura",
      plot: "En medio del conflicto entre las ciudades gemelas de Piltover y Zaun, dos hermanas luchan en bandos opuestos de una guerra tecnológica y mágica."
    },
    {
      title: "The Boys (2024)",
      cat: "s5",
      rating: 8.7,
      cover: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80",
      year: "2024",
      release_date: "2024-06-13",
      genre: "Acción, Superhéroes, Comedia negra, Suspenso",
      plot: "Un grupo de justicieros se propone derrotar a superhéroes corruptos que abusan de sus superpoderes con el respaldo de corporaciones sin escrúpulos."
    },
    {
      title: "Ted Lasso (2020)",
      cat: "s7",
      rating: 8.8,
      cover: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=80",
      year: "2020",
      release_date: "2020-08-14",
      genre: "Comedia, Deportes, Sentimental",
      plot: "Un entrenador de fútbol americano universitario viaja a Inglaterra para dirigir a un equipo de fútbol profesional de la Premier League sin experiencia."
    }
  ];

  const series: SeriesStream[] = [];
  // Generate 120 series distributed across years and genres for 60-en-60 pagination testing
  for (let i = 0; i < 120; i++) {
    const base = baseSeries[i % baseSeries.length];
    const vol = Math.floor(i / baseSeries.length);
    series.push({
      series_id: 5000 + i,
      name: vol === 0 ? base.title : `${base.title} (Temporada ${vol + 1})`,
      category_id: base.cat,
      cover: base.cover,
      rating: base.rating,
      rating_5based: Math.round((base.rating / 2) * 10) / 10,
      release_date: base.release_date,
      year: base.year,
      plot: base.plot,
      cast: "Elenco Internacional, Protagonistas Galardonados",
      director: "Showrunner Especialista",
      genre: base.genre
    });
  }
  return series;
}
