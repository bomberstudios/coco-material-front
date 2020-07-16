import Vue from 'vue'
import Vuex from 'vuex'
import appService from '../service/app.service.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    tags: [],
    vectors: [],
    filteredVectors: [],
    searchTags: []
  },
  getters: {
    tagsList: state => state.tags,
    filteredVectorsList: state => state.filteredVectors,
    searchTags: state => state.searchTags
  },
  mutations: {
    getTagsSuccess (state, tags) {
      state.tags = tags
    },
    getVectorsSuccess (state, vectors) {
      state.vectors = vectors
    },
    getVectorsByTagSuccess (state, payload) {
      state.filteredVectors = payload.vectors
      state.searchTags = payload.tags
    },
    clearSearchTags (state) {
      state.searchTags = []
    },
    clearFilteredVectors (state) {
      state.filteredVectors = []
    }
  },
  actions: {
    getTags ({ commit }) {
      appService.getTags()
        .then(tags => {
          commit('getTagsSuccess', tags)
        })
    },
    getVectors ({ commit }) {
      appService.getVectors()
        .then(vectors => {
          commit('getVectorsSuccess', vectors)
        })
        .catch(error => console.log(error))
    },
    getVectorByTag ({ commit }, tags) {
      appService.getVectorByTag(tags)
        .then(vectors => {
          commit('getVectorsByTagSuccess', { vectors, tags })
        })
    }
  },
  modules: {
  }
})
