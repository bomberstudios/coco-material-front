<template src="./modal.html" lang="html"></template>
<style src="./modal.scss"  lang="scss" scoped></style>

<script>
import { defineComponent } from 'vue'
import api from '@/service/api'

export default defineComponent({
  name: 'modal',
  props: {
    vectorId: null,
    isHorizontal: null,
    customizeBulk: null,
    totalVectors: null,
    tags: null
  },
  data () {
    return {
      fillColor: ['#FFFFFF', '#FF4E4E', '#FF9E48', '#FFD144', '#3CD77D', '#378CFF', '#D974FF', 'none'],
      strokeColor: ['#000000', '#FF4E4E', '#FF9E48', '#FFD144', '#3CD77D', '#378CFF', '#D974FF', '#FFFFFF'],
      defaultStroke: '#000000',
      defaultFill: '#FFFFFF',
      vector: null,
      svgCode: null,
      vectorTags: [],
      hasJustStroke: false,
      hasColorSuggestion: false,
      // Form params
      downloadType: 'png', // values: png, svg
      colorOption: 'black-white', // values: black-white, color-suggestion, edit
      strokeHexValue: '#000000',
      fillHexValue: '#FFFFFF',
      downloadSuggested: false,
      size: 0 // values: 0, 128, 256, 512
    }
  },
  async mounted () {
    document.body.style.width = document.body.clientWidth + 'px'
    document.body.style.top = `-${window.scrollY}px`
    document.body.style.position = 'fixed'

    // Download vector
    this.vector = await api.getVector({ id: this.vectorId, tags: this.tags, ordering: this.$route.query.ordering })
    this.svgCode = this.vector.svgContent
    this.vectorTags = this.vector.tags.split(',')

    // Check if the image has only one path
    const svgEl = document.createElement('div')
    svgEl.innerHTML = this.svgCode
    this.hasJustStroke = (svgEl.querySelectorAll('path').length === 1)

    // Check if image has color suggestion
    this.hasColorSuggestion = (this.vector.coloredSvg || this.vector.fillColor || this.vector.strokeColor)

    // If hasColorSuggesteion select it by default
    if (this.hasColorSuggestion) {
      this.selectColorSuggestion()
    }

    // Add data to the url
    if (!this.customizeBulk) {
      const query = Object.assign({}, this.$route.query, { vectorId: this.vector.id })
      this.$router.replace({ query })
    }
  },
  async umounted () {
    document.body.style.position = undefined
  },
  methods: {
    // Close modal
    close () {
      const actualScroll = document.body.style.top
      document.body.style.position = null
      document.body.style.top = null
      document.body.style.width = null
      setTimeout(() => window.scrollTo(0, parseInt(actualScroll || '0') * -1), 100)

      this.$emit('close')

      // Delete data from url
      if (this.$route.query.vectorId) {
        const query = Object.assign({}, this.$route.query)
        delete query.vectorId
        this.$router.replace({ query })
      }
    },
    async goToVector (vectorId) {
      // const query = Object.assign({}, this.$route.query, { vectorId })
      // this.$router.push({ path: '/results', query })
      // Download vector
      this.vector = await api.getVector({ id: vectorId, tags: this.tags, ordering: this.$route.query.ordering })
      this.svgCode = this.vector.svgContent
      this.vectorTags = this.vector.tags.split(',')

      // Check if the image has only one path
      const svgEl = document.createElement('div')
      svgEl.innerHTML = this.svgCode
      this.hasJustStroke = (svgEl.querySelectorAll('path').length === 1)

      // Inicialize form params
      this.downloadType = 'png' // values: png, svg
      this.colorOption = 'black-white' // values: black-white, color-suggestion, edit
      this.strokeHexValue = '#000000'
      this.fillHexValue = '#FFFFFF'
      this.downloadSuggested = false
      this.size = 0 // values: 0, 128, 256, 512

      // Check if image has color suggestion
      this.hasColorSuggestion = (this.vector.coloredSvg || this.vector.fillColor || this.vector.strokeColor)

      // If hasColorSuggesteion select it by default
      if (this.hasColorSuggestion) {
        this.selectColorSuggestion()
      }

      // Add data to the url
      const query = Object.assign({}, this.$route.query, { vectorId })
      this.$router.replace({ query })
    },
    // Tag clicked
    searchVector (tag) {
      this.close()
      this.$emit('search', tag)
    },
    // Download type settings
    selectDownloadTypePng () {
      this.downloadType = 'png'
      this.size = 0
    },
    selectDownloadTypeSvg () {
      this.downloadType = 'svg'
      this.size = 0
    },
    // Color settings
    //
    // NOTE:
    //  Images could have one or two paths:
    //    - Images with two path:
    //       * Path 0 is fill
    //       * Path 1 is stroke
    //    - Images with one path:
    //       * Path 0 is stroke
    //
    selectColorBlackAndWhite () {
      this.colorOption = 'black-white'

      this.svgCode = this.vector.svgContent
      this.downloadSuggested = false
      this.selectFill()
      this.selectStroke()
    },
    selectColorSuggestion () {
      this.colorOption = 'color-suggestion'

      this.svgCode = this.vector.coloredSvgContent
      if (this.vector.coloredSvg) {
        this.downloadSuggested = true
      } else {
        this.downloadSuggested = false
        this.selectFill(this.vector.fillColor)
        this.selectStroke(this.vector.strokeColor)
      }

      if (this.customizeBulk) {
        this.downloadSuggested = true
      }
    },
    selectColorEdit () {
      this.colorOption = 'edit'

      this.strokeHexValue = '#000000'
      this.fillHexValue = '#FFFFFF'
      this.svgCode = this.vector.svgContent
      this.downloadSuggested = false
    },
    selectStroke (color) {
      const pathIdx = this.hasJustStroke ? 0 : 1
      const pathEl = document.querySelectorAll('#preview path')[pathIdx]

      if (color) {
        if (color.length === 7) {
          this.strokeHexValue = color
        } else {
          return // invalid hex color
        }
      } else {
        this.strokeHexValue = this.defaultStroke
      }

      if (pathEl) {
        pathEl.style.fill = this.strokeHexValue
      }
    },
    selectFill (color) {
      if (this.hasJustStroke) {
        return // Threre is no fill to set
      }
      const pathEl = document.querySelectorAll('#preview path')[0]

      if (color) {
        if (color.length === 7 || color === 'none') {
          this.fillHexValue = color
        } else {
          return // invalid hex color
        }
      } else {
        this.fillHexValue = this.defaultFill
      }

      if (pathEl) {
        pathEl.style.fill = this.fillHexValue
      }
    },
    // Submit form
    download () {
      const queryUrl = new URLSearchParams()

      // img format
      queryUrl.set('img_format', this.downloadType)

      // size
      if (!(this.downloadType === 'svg')) {
        queryUrl.set('size', this.size)
      }

      if (!this.downloadSuggested) {
        // fill
        const fill = (this.fillHexValue)
          ? this.fillHexValue.replace('#', '')
          : this.defaultFill.replace('#', '')
        queryUrl.set('fill', fill)

        // stroke
        const stroke = this.strokeHexValue
          ? this.strokeHexValue.replace('#', '')
          : this.defaultStroke.replace('#', '')
        queryUrl.set('stroke', stroke)
      } else {
        // select suggested vector
        queryUrl.set('suggested', true)
      }

      if (this.customizeBulk) {
        // tags
        const tags = this.tags.length
          ? this.tags.join()
          : 'all'
        queryUrl.set('tags', tags)
      } else {
        // id
        queryUrl.set('id', this.vector.id)
      }

      // and download the image
      window.open(`${process.env.VUE_APP_API_URL}/download/?${queryUrl.toString()}`, '_blank')
      this.trackDownload()
    },
    trackDownload (name) {
      if (this.$matomo) {
        const category = this.customizeBulk
          ? 'download-bulk'
          : 'download'
        const action = this.downloadType === 'svg'
          ? 'svg'
          : `${this.downloadType}-${this.size}`
        const name = this.customizeBulk
          ? (this.tags.length ? this.tags.join() : 'all')
          : this.vector.name
        this.$matomo.trackEvent(category, action, name)
      }
    }
  }
})
</script>
