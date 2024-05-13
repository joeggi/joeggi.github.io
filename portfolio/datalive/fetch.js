const { createApp } = Vue

createApp({
    data() {
        return {
            info: null,
            query: null,
            title: null,
            image: null,
            episodes: 0,
            views: 0,
            rating: 0,
            seasons: 0,
            movies: 0,
            episodeInfo: []
        }
    },
    methods: {
        async search() {
            this.resetData()
            axios.get('https://api.jikan.moe/v4/anime?q=' + this.query.replace(/\s/g, '+'))
                .then(async (response) => {
                    console.log(response.data.data)
                    this.title = response.data.data[0].title
                    this.image = response.data.data[0].images.jpg.image_url
                    this.episodes = response.data.data[0].episodes
                    this.rating = response.data.data[0].score

                    this.probeEpisodeInfo()

                    var hasSequels = await this.probeSequels(response.data.data[0].mal_id)

                    for (let i = 0; i < response.data.data.length; i++) {
                        if (i == 0) {
                            this.seasons += 1
                            axios.get('https://api.jikan.moe/v4/anime/' + response.data.data[i].mal_id + '/statistics')
                                .then((response) => {
                                    this.views += response.data.data.watching
                                    this.views += response.data.data.completed
                                })

                        }
                        else if (hasSequels == false) {
                            break
                        }
                        else if (response.data.data[i].status == "Not yet aired") {
                            continue
                        }
                        else if (!response.data.data[i].type == "TV" && !response.data.data[i].type == "Movie" && !response.data.data[i].type == "ONA") {
                            continue
                        }
                        else if (response.data.data[i].type == "OVA") {
                            continue
                        }
                        else if (response.data.data[i].title.includes("Recap") || response.data.data[i].title.includes("PV")) {
                            continue
                        }
                        else if (response.data.data[i].favorites < 100) {
                            continue
                        }
                        else if (response.data.data[i].duration.includes("sec")) {
                            continue
                        }
                        else if (response.data.data[i].type == "Movie") {
                            this.movies += 1
                        }
                        else if (response.data.data[i].title.includes(this.title)) {

                            if (response.data.data[i].aired.from > response.data.data[0].aired.to && response.data.data[i].episodes > 1) {
                                this.seasons += 1
                                this.episodes += response.data.data[i].episodes
                                console.log(response.data.data[i])
                            }
                            else if (response.data.data[i].aired.from > response.data.data[0].aired.to) {
                                this.movies += 1
                                console.log(response.data.data[i])
                            }
                        }
                        else {
                            break
                        }
                    }
                })
        },
        async probeSequels(mid) {
            return new Promise((resolve, reject) => {
                axios.get('https://api.jikan.moe/v4/anime/' + mid + '/relations')
                    .then((sequels) => {
                        let hasSequel = false;
                        console.log(sequels.data.data)
                        sequels.data.data.forEach((show) => {
                            if ((show.relation == 'Sequel' || show.relation == 'Prequel') && show.entry[0].type == 'anime') {
                                hasSequel = true
                            }
                        })
                        resolve(hasSequel)
                    })
                    .catch(error => {
                        reject(error)
                    });
            });
        },
        probeEpisodeInfo() {
            axios.get({ url: "https://www.reddit.com/r/anime/search/?q=" + this.title + " discussion.json", withCredentials: false })
                .then((post) => {
                    console.log(post)
                })
        },
        selectDataType(info) {
            if (info == 'eps') {
                this.info = 'eps'
            }
            else if (info == 'views') {
                this.info = 'views'
            }
            else if (info == 'ratings') {
                this.info = 'ratings'
            }
            else if (info == 'seasons') {
                this.info = 'seasons'
            }
        },
        resetData() {
            this.info = null
            this.episodes = 0
            this.views = 0
            this.rating = 0
            this.seasons = 0
            this.movies = 0
        }
    }
}).mount('#app')