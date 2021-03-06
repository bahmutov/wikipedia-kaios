import { useState, useLayoutEffect } from 'preact/hooks'
import { useSoftkey } from 'hooks'
import { viewport } from 'utils'

export const useArticlePagination = (
  elementRef,
  article,
  anchor
) => {
  const [currentSection, setCurrentSection] = useState(findSection(article.toc, anchor))
  const [isLastPage, setIsLastPage] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const numOfSection = article.sections.length

  useSoftkey('Article', {
    onKeyArrowDown: () => {
      const previous = elementRef.current.scrollLeft
      elementRef.current.scrollLeft += viewport.width
      const after = elementRef.current.scrollLeft

      // show the next section of the article
      if (previous === after) {
        showNextSection()
      } else {
        setCurrentPage(p => p + 1)
      }
    },
    onKeyArrowUp: () => {
      const previous = elementRef.current.scrollLeft
      elementRef.current.scrollLeft -= viewport.width
      const after = elementRef.current.scrollLeft

      // show the previous section of the article
      if (previous === after) {
        showPrevSection()
      } else {
        setCurrentPage(p => p - 1)
      }
    }
  }, [currentSection])

  useLayoutEffect(() => {
    if (isLastPage) {
      const scrollWidth = elementRef.current.scrollWidth
      const offset = viewport.width
      elementRef.current.scrollLeft = scrollWidth - offset
      setCurrentPage(elementRef.current.scrollLeft / viewport.width)
      setIsLastPage(false)
    } else {
      elementRef.current.scrollLeft = 0
      setCurrentPage(0)
    }
  }, [currentSection])

  useLayoutEffect(() => {
    if (anchor) {
      const anchorElement = Array
        .from(elementRef.current.querySelectorAll('.title, h3, h4'))
        .find(e => e.getAttribute('data-anchor') === anchor)

      if (anchorElement) {
        const offset = Math.floor(
          anchorElement.getBoundingClientRect().left / viewport.width
        )
        elementRef.current.scrollLeft += offset * viewport.width
        setCurrentPage(elementRef.current.scrollLeft / viewport.width)
      }
    }
  }, [anchor])

  const showNextSection = () => {
    const nextSection = currentSection + 1
    if (nextSection < numOfSection) {
      setCurrentSection(nextSection)
    }
  }

  const showPrevSection = () => {
    const prevSection = currentSection - 1
    if (prevSection >= 0) {
      setCurrentSection(prevSection)
      setIsLastPage(true)
    }
  }

  return [currentSection, setCurrentSection, currentPage]
}

const findSection = (toc, anchor) => {
  if (!anchor) {
    return 0
  }
  return toc.find(item => item.anchor === anchor).sectionIndex
}
