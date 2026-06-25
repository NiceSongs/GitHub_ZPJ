import { Fragment, createElement, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './App.css'
import BorderGlow from './BorderGlow'
import Grainient from './Grainient'
import { portfolioModules } from './portfolioManifest'

gsap.registerPlugin(ScrollTrigger)

const withBase = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
const portfolioVideoVolume = 0.65
const heroVideoMaxDuration = 20000
const mobileRatioDesignWidth = 1440
const desktopMobilePreviewWidth = 540

const getVideoMimeType = (url) => {
  if (url.toLowerCase().endsWith('.webm')) return 'video/webm'
  if (url.toLowerCase().endsWith('.mov')) return 'video/quicktime'
  return 'video/mp4'
}

const isTransparentPortfolioVideo = (item) => item.extension === 'WEBM'

const heroVideos = [
  '/portfolio/Ai-%E4%BA%A7%E5%93%81%E5%8A%A8%E7%94%BB/%E6%98%BE%E5%8D%A1%E5%8A%A8%E7%94%BB-%E9%AB%98%E6%B8%85.mp4',
  '/portfolio/AI-%E7%BC%96%E5%AF%BC%E4%B8%8E%E5%8A%A8%E7%94%BB/3D-%E5%8E%9F%E5%88%9B%E5%8A%A8%E7%94%BB.mp4',
  '/portfolio/AI-%E7%BC%96%E5%AF%BC%E4%B8%8E%E5%8A%A8%E7%94%BB/IP%E5%8A%A8%E7%94%BB-0.mp4',
  '/portfolio/AI-%E7%BC%96%E5%AF%BC%E4%B8%8E%E5%8A%A8%E7%94%BB/IP%E5%8A%A8%E7%94%BB-1.mp4',
  '/portfolio/AI-%E7%BC%96%E5%AF%BC%E4%B8%8E%E5%8A%A8%E7%94%BB/IP%E5%8A%A8%E7%94%BB-2.mp4',
]

const heroVideoObjectPositions = {
  '/portfolio/AI-%E7%BC%96%E5%AF%BC%E4%B8%8E%E5%8A%A8%E7%94%BB/3D-%E5%8E%9F%E5%88%9B%E5%8A%A8%E7%94%BB.mp4': '18% 76%',
}

const metrics = [
  {
    value: '100万+美元',
    label: '素材覆盖产品单月销售额',
    detail: '健康类跨境电商广告素材，用于 TK、FB 投放引流到独立站。',
  },
  {
    value: '25-30条',
    label: '日均视频素材片段产出',
    detail: '从卖点拆解、脚本分镜到 AI 生成、剪辑包装与测试迭代。',
  },
  {
    value: '70+人',
    label: 'AI 工具与工作流培训',
    detail: '覆盖提示词、工具使用、素材规范、案例复盘与 SOP 落地。',
  },
]

const strengths = [
  {
    title: '从运营目标反推视觉方案',
    body: '熟悉跨境电商广告内容生产，能把卖点、痛点、用户场景和素材测试目标拆成可执行的脚本与画面。',
  },
  {
    title: 'AI 生成到后期交付闭环',
    body: '熟悉 AI 生图、生视频、换脸换景、剪辑包装和素材复盘，能快速验证方向并形成稳定产出节奏。',
  },
  {
    title: '自学能力强硬 拥有综合能力',
    body: '具备快速自学与跨工具整合能力，能把 AI 生成、视频剪辑、3D 视觉和复盘 SOP 串联起来，独立拆解问题并转化为稳定产出。',
  },
  {
    title: 'SOP 沉淀与团队培训',
    body: '能把个人制作经验整理成流程、规范与案例，推动团队理解 AI 工具、提示词和广告素材工作流。',
  },
]

const timeline = [
  {
    time: '2024.09 - 2026.06',
    role: '深圳骏弘科技有限公司 / AI设计师、AI视频设计师',
    text: '独立负责健康类跨境电商 AI 视频素材生产，对接运营需求，建立 AI 视频工作流并完成高频广告素材交付。',
  },
  {
    time: '2023.11 - 2024.08',
    role: 'AI内容与视觉工作流学习',
    text: '系统学习生成式 AI 底层逻辑、提示词和工作流，并结合 3D 设计经验探索产品展示和广告视频落地方式。',
  },
  {
    time: '2022.09 - 2023.11',
    role: '湖南远晴文化有限公司 / 3D设计师',
    text: '负责 3D 动画项目制作，参与建模、绑定、材质贴图、动画和渲染，曾带领实习生协作推进项目。',
  },
  {
    time: '2022.02 - 2022.08',
    role: '深圳市璇玑动画科技有限公司 / 3D建模师',
    text: '负责产品建模、材质制作、渲染、模型修改，并根据项目需求制作产品交互动画。',
  },
]

const getMediaSortOrder = (item, index) => {
  const ipAnimationMatch = item.title.match(/^IP动画-(\d+)/)
  const tanningCutMatch = item.title.match(/^美黑混剪\+口播\s+\((\d+)\)/)

  if (ipAnimationMatch) return Number(ipAnimationMatch[1])
  if (tanningCutMatch) return 1000 + Number(tanningCutMatch[1])

  return 100 + index
}

const getOrderedModuleMedia = (media) => (
  media
    .map((item, index) => ({ item, order: getMediaSortOrder(item, index) }))
    .sort((currentItem, nextItem) => currentItem.order - nextItem.order)
    .map(({ item }) => item)
)

const preparePortfolioVideo = (video) => {
  video.volume = portfolioVideoVolume
}

const preventPortfolioDownload = (event) => {
  event.preventDefault()
}

const handlePortfolioVideoPlay = (event) => {
  const currentVideo = event.currentTarget
  const isTransparentVideo = currentVideo.dataset.transparentVideo === 'true'

  document.querySelectorAll('[data-portfolio-video="true"]').forEach((video) => {
    if (video !== currentVideo) {
      video.muted = true
    }
  })

  currentVideo.volume = portfolioVideoVolume
  currentVideo.muted = isTransparentVideo
}

const portfolioModuleOrder = [
  'AI 编导与动画',
  'AI 产品动画',
  'AI真实素材片段混剪',
]
const hiddenPortfolioModules = ['技术思路分享']

export function PortfolioCarouselSection({ module }) {
  const [workIndex, setWorkIndex] = useState(0)
  const [direction, setDirection] = useState('next')
  const [isAnimating, setIsAnimating] = useState(false)
  const [mediaOrientations, setMediaOrientations] = useState({})
  const works = getOrderedModuleMedia(module.media)
  const activeWork = works[workIndex]
  const carouselWorks = works.length
    ? [
        {
          item: works[(workIndex - 1 + works.length) % works.length],
          position: 'previous',
        },
        {
          item: activeWork,
          position: 'active',
        },
        {
          item: works[(workIndex + 1) % works.length],
          position: 'next',
        },
      ]
    : []

  const changeWork = (nextDirection) => {
    setDirection(nextDirection)
    setIsAnimating(true)
    setWorkIndex((currentIndex) => (
      nextDirection === 'previous'
        ? (currentIndex === 0 ? works.length - 1 : currentIndex - 1)
        : (currentIndex + 1) % works.length
    ))
  }

  const showPreviousWork = () => {
    changeWork('previous')
  }

  const showNextWork = () => {
    changeWork('next')
  }

  const rememberMediaOrientation = (item, width, height) => {
    if (!width || !height) return
    const ratio = width / height
    const orientation = ratio < 0.8 ? 'portrait' : ratio < 1.25 ? 'square' : 'landscape'

    setMediaOrientations((currentOrientations) => ({
      ...currentOrientations,
      [item.url]: orientation,
    }))
  }

  const getMediaOrientation = (item) => (
    mediaOrientations[item.url] || (item.title.startsWith('IP动画-') ? 'portrait' : 'landscape')
  )

  useEffect(() => {
    if (!isAnimating) return undefined

    const animationTimer = window.setTimeout(() => {
      setIsAnimating(false)
    }, 280)

    return () => window.clearTimeout(animationTimer)
  }, [isAnimating, workIndex])

  useEffect(() => {
    if (!activeWork || !isTransparentPortfolioVideo(activeWork)) return undefined

    const playTimer = window.setTimeout(() => {
      const section = document.getElementById(`portfolio-${module.id}`)
      const activeVideo = section?.querySelector('.media-card--active video[data-transparent-video="true"]')
      if (!activeVideo) return

      activeVideo.muted = true
      activeVideo.play().catch(() => {})
    }, 320)

    return () => window.clearTimeout(playTimer)
  }, [activeWork, module.id, workIndex])

  if (!activeWork) return null

  return (
    <section className="portfolio-feature" id={`portfolio-${module.id}`}>
      <div className="container portfolio-feature__grid">
        <div className="portfolio-feature__intro">
          <p className="eyebrow">{module.folder}</p>
          <h3>{module.title}</h3>
          <p>{module.description}</p>
        </div>

        <div
          className={`feature-carousel feature-carousel--${direction} feature-carousel--active-${getMediaOrientation(activeWork)}${isAnimating ? ' is-switching' : ''}`}
          aria-label={`${module.title}作品轮播`}
        >
          <div className="feature-stage">
            {carouselWorks.map(({ item, position }) => (
              <article
                className={`media-card media-card--featured media-card--${position} media-card--${getMediaOrientation(item)}`}
                key={item.url}
                aria-hidden={position !== 'active'}
              >
                <div className="media-frame">
                  {item.type === 'video' ? (
                    <video
                      controls={position === 'active'}
                      preload={isTransparentPortfolioVideo(item) ? 'auto' : 'metadata'}
                      data-portfolio-video="true"
                      data-transparent-video={isTransparentPortfolioVideo(item) ? 'true' : undefined}
                      controlsList="nodownload noremoteplayback"
                      disablePictureInPicture
                      draggable="false"
                      playsInline
                      autoPlay={isTransparentPortfolioVideo(item) && position === 'active'}
                      loop={isTransparentPortfolioVideo(item)}
                      muted={isTransparentPortfolioVideo(item)}
                      onContextMenu={preventPortfolioDownload}
                      onDragStart={preventPortfolioDownload}
                      onLoadedMetadata={(event) => {
                        preparePortfolioVideo(event.currentTarget)
                        if (isTransparentPortfolioVideo(item) && position === 'active') {
                          event.currentTarget.muted = true
                          event.currentTarget.play().catch(() => {})
                        }
                        rememberMediaOrientation(
                          item,
                          event.currentTarget.videoWidth,
                          event.currentTarget.videoHeight,
                        )
                      }}
                      onCanPlay={(event) => {
                        if (isTransparentPortfolioVideo(item) && position === 'active') {
                          event.currentTarget.muted = true
                          event.currentTarget.play().catch(() => {})
                        }
                      }}
                      onPlay={handlePortfolioVideoPlay}
                    >
                      <source src={withBase(item.url)} type={getVideoMimeType(item.url)} />
                    </video>
                  ) : (
                    <img
                      src={withBase(item.url)}
                      alt={item.title}
                      loading="lazy"
                      draggable="false"
                      onContextMenu={preventPortfolioDownload}
                      onDragStart={preventPortfolioDownload}
                      onLoad={(event) => {
                        rememberMediaOrientation(
                          item,
                          event.currentTarget.naturalWidth,
                          event.currentTarget.naturalHeight,
                        )
                      }}
                    />
                  )}
                </div>
                <div className="media-card__body">
                  <h4>{item.title}</h4>
                </div>
              </article>
            ))}
            <button
              className="feature-arrow feature-arrow--previous"
              type="button"
              onClick={showPreviousWork}
              aria-label="上一个作品"
            />
            <button
              className="feature-arrow feature-arrow--next"
              type="button"
              onClick={showNextWork}
              aria-label="下一个作品"
            />
          </div>

          <div className="feature-counter">{workIndex + 1} / {works.length}</div>
        </div>
      </div>
    </section>
  )
}

function PortfolioModuleDivider({ currentIndex, nextModule }) {
  return (
    <div className="container portfolio-transition" aria-hidden="true">
      <span className="portfolio-transition__index">
        {String(currentIndex + 1).padStart(2, '0')}
      </span>
      <span className="portfolio-transition__line" />
      <span className="portfolio-transition__label">Next Module</span>
      <strong>{nextModule.title}</strong>
    </div>
  )
}

function App() {
  const [heroVideoIndex, setHeroVideoIndex] = useState(0)
  const [isNavFloating, setIsNavFloating] = useState(false)
  const [activeNavId, setActiveNavId] = useState('')
  const [previewMode, setPreviewMode] = useState('desktop')
  const [viewportSize, setViewportSize] = useState({ width: 1440, height: 900 })
  const [scaledStageHeight, setScaledStageHeight] = useState(null)
  const heroVideoRef = useRef(null)
  const responsiveContentRef = useRef(null)
  const responsiveStageRef = useRef(null)
  const siteShellRef = useRef(null)
  const heroVideo = heroVideos[heroVideoIndex]
  const isPhoneViewport = viewportSize.width <= 640
  const isDesktopMobilePreview = previewMode === 'mobile' && !isPhoneViewport
  const isPhoneRatioLayout = previewMode === 'mobile' || isPhoneViewport
  const phoneViewportWidth = previewMode === 'mobile' && !isPhoneViewport
    ? desktopMobilePreviewWidth
    : viewportSize.width
  const phoneViewportHeight = isDesktopMobilePreview
    ? Math.round(phoneViewportWidth * 16 / 9)
    : viewportSize.height
  const phoneStageScale = Math.min(1, phoneViewportWidth / mobileRatioDesignWidth)
  const phoneDesignHeight = Math.ceil(phoneViewportHeight / phoneStageScale)
  const portfolioDisplayModules = portfolioModules
    .filter((module) => !hiddenPortfolioModules.includes(module.title))
    .sort((currentModule, nextModule) => {
      const currentOrder = portfolioModuleOrder.indexOf(currentModule.title)
      const nextOrder = portfolioModuleOrder.indexOf(nextModule.title)

      return (currentOrder === -1 ? 99 : currentOrder) - (nextOrder === -1 ? 99 : nextOrder)
    })
  const portfolioTotalCount = portfolioDisplayModules.reduce((total, module) => total + module.count, 0)
  const portfolioVideoCount = portfolioDisplayModules.reduce((total, module) => total + module.videos, 0)

  const playNextHeroVideo = () => {
    setHeroVideoIndex((currentIndex) => (currentIndex + 1) % heroVideos.length)
  }

  useEffect(() => {
    const heroVideoTimer = window.setTimeout(() => {
      setHeroVideoIndex((currentIndex) => (currentIndex + 1) % heroVideos.length)
    }, heroVideoMaxDuration)

    return () => window.clearTimeout(heroVideoTimer)
  }, [heroVideoIndex])

  useEffect(() => {
    const video = heroVideoRef.current
    if (!video) return

    video.muted = true
    video.currentTime = 0
    video.play().catch(() => {
      // Muted autoplay can still be interrupted during fast reloads.
    })
  }, [heroVideoIndex])

  useLayoutEffect(() => {
    const root = siteShellRef.current
    if (!root) return undefined

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      root.classList.add('motion-ready')
      return undefined
    }

    const scrollContainer = isDesktopMobilePreview ? responsiveStageRef.current : undefined
    const context = gsap.context(() => {
      root.classList.add('motion-ready')

      const openingTimeline = gsap.timeline({
        defaults: { ease: 'expo.out' },
      })

      openingTimeline
        .set([
          '.nav',
          '.hero__name-line',
          '.hero__role',
          '.hero__statement',
          '.hero__copy',
          '.hero__actions',
        ], { autoAlpha: 0 })
        .set('.hero__video', { scale: 1.14, filter: 'saturate(0.56) contrast(1.24) brightness(0.42)' })
        .set('.opening-panel', { scaleX: 1, transformOrigin: 'left center' })
        .set('.opening-mark__line', { scaleX: 0, transformOrigin: 'left center' })
        .to('.opening-mark__line', {
          scaleX: 1,
          duration: 1.15,
          ease: 'power4.inOut',
          stagger: 0.13,
        }, 0.08)
        .to('.opening-mark__text', {
          y: 0,
          autoAlpha: 1,
          duration: 0.95,
          ease: 'power3.out',
        }, 0.24)
        .to('.opening-panel', {
          scaleX: 0,
          duration: 1.22,
          ease: 'power4.inOut',
          transformOrigin: 'right center',
        }, 1.05)
        .to('.opening-mark', {
          autoAlpha: 0,
          y: -24,
          duration: 0.72,
          ease: 'power3.inOut',
        }, 1.02)
        .to('.hero__video', {
          scale: 1,
          filter: 'saturate(0.86) contrast(1.08) brightness(0.76)',
          duration: 2.1,
          ease: 'power3.out',
        }, 0.9)
        .fromTo('.hero__name-line', {
          yPercent: 110,
          scaleY: 0.72,
          clipPath: 'inset(0 0 100% 0)',
        }, {
          autoAlpha: 1,
          yPercent: 0,
          scaleY: 1,
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.25,
        }, 1.34)
        .fromTo('.hero__statement', {
          y: 78,
          scaleX: 0.88,
          transformOrigin: 'left center',
          clipPath: 'inset(100% 0 0 0)',
        }, {
          autoAlpha: 1,
          y: 0,
          scaleX: 1,
          clipPath: 'inset(0% 0 0 0)',
          duration: 1.38,
        }, 1.58)
        .to('.hero__role', {
          autoAlpha: 1,
          y: 0,
          duration: 0.88,
        }, 1.78)
        .fromTo(['.hero__copy', '.hero__actions', '.nav'], {
          y: 34,
          filter: 'blur(12px)',
        }, {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1,
          stagger: 0.12,
        }, 2.08)
        .set('.opening-animation', { autoAlpha: 0, pointerEvents: 'none' })

      gsap.to('.hero__video', {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
          scroller: scrollContainer,
        },
      })

      const sectionSelectors = [
        '.about',
        '.projects',
        '.portfolio-feature',
        '.strengths',
        '.contact',
      ]

      sectionSelectors.forEach((selector) => {
        gsap.utils.toArray(selector).forEach((section) => {
          const heading = section.querySelector('h2, .portfolio-feature__intro h3')
          const kicker = section.querySelector('.eyebrow')
          const copy = section.querySelector('.section-copy, .section-heading p, .portfolio-feature__intro p:last-of-type, .contact p')
          const revealItems = section.querySelectorAll('.metric, .timeline__item, .portfolio-heading__meta span, .strength-card, .contact__links > *')
          const carousel = section.querySelector('.feature-carousel')
          const media = section.matches('.portfolio-feature')
            ? null
            : section.querySelector('.about__media img, .media-frame img, .media-frame video')

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: 'top 78%',
              end: 'bottom 20%',
              toggleActions: 'play none none none',
              once: true,
              scroller: scrollContainer,
            },
            defaults: { ease: 'power4.out' },
          })

          if (kicker) {
            timeline.fromTo(kicker, {
              autoAlpha: 0,
              y: 24,
              letterSpacing: '0.42em',
            }, {
              autoAlpha: 1,
              y: 0,
              letterSpacing: '0.08em',
              duration: 0.85,
            }, 0)
          }

          if (heading) {
            timeline.fromTo(heading, {
              autoAlpha: 0,
              x: -96,
              scaleX: 0.72,
              transformOrigin: 'left center',
              clipPath: 'inset(0 100% 0 0)',
            }, {
              autoAlpha: 1,
              x: 0,
              scaleX: 1,
              clipPath: 'inset(0 0% 0 0)',
              duration: 1.16,
            }, 0.06)
          }

          if (copy) {
            timeline.fromTo(copy, {
              autoAlpha: 0,
              y: 34,
              filter: 'blur(10px)',
            }, {
              autoAlpha: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 0.92,
            }, 0.34)
          }

          if (media) {
            timeline.fromTo(media, {
              autoAlpha: 0,
              y: 72,
              scale: 1.16,
              clipPath: 'inset(18% 0 18% 0)',
            }, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              clipPath: 'inset(0% 0 0% 0)',
              duration: 1.22,
            }, 0.26)

            gsap.to(media, {
              yPercent: -7,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.5,
                scroller: scrollContainer,
              },
            })
          }

          if (carousel) {
            timeline.fromTo(carousel, {
              autoAlpha: 0,
              y: 78,
              scale: 0.96,
              filter: 'blur(14px)',
              clipPath: 'inset(8% 0 12% 0)',
            }, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
              clipPath: 'inset(0% 0 0% 0)',
              duration: 1.16,
            }, 0.44)
          }

          if (revealItems.length) {
            timeline.fromTo(revealItems, {
              autoAlpha: 0,
              y: 58,
              scale: 0.94,
              clipPath: 'inset(0 0 100% 0)',
            }, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              clipPath: 'inset(0 0 0% 0)',
              duration: 0.92,
              stagger: 0.11,
            }, 0.52)
          }
        })
      })
    }, root)

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 250)

    return () => {
      window.clearTimeout(refreshTimer)
      context.revert()
    }
  }, [isDesktopMobilePreview])

  useEffect(() => {
    const updateNavState = () => {
      const scrollContainer = isDesktopMobilePreview ? responsiveStageRef.current : null
      const scrollTop = scrollContainer ? scrollContainer.scrollTop : window.scrollY
      const viewportHeight = scrollContainer ? scrollContainer.clientHeight : window.innerHeight

      responsiveContentRef.current?.style.setProperty(
        '--phone-floating-offset',
        isPhoneRatioLayout ? `${scrollTop / phoneStageScale}px` : '0px',
      )
      setIsNavFloating(scrollTop > viewportHeight - 96)
    }

    const scrollContainer = isDesktopMobilePreview ? responsiveStageRef.current : null

    updateNavState()
    window.addEventListener('scroll', updateNavState, { passive: true })
    window.addEventListener('resize', updateNavState)
    scrollContainer?.addEventListener('scroll', updateNavState, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateNavState)
      window.removeEventListener('resize', updateNavState)
      scrollContainer?.removeEventListener('scroll', updateNavState)
    }
  }, [isDesktopMobilePreview, isPhoneRatioLayout, phoneStageScale])

  useEffect(() => {
    const navSections = [
      { id: 'about', navId: 'about' },
      { id: 'projects', navId: 'portfolio' },
      { id: 'strengths', navId: 'strengths' },
      { id: 'contact', navId: 'contact' },
    ]

    const updateActiveNav = () => {
      const scrollContainer = isDesktopMobilePreview ? responsiveStageRef.current : null
      const scrollTop = scrollContainer ? scrollContainer.scrollTop : window.scrollY
      const viewportHeight = scrollContainer ? scrollContainer.clientHeight : window.innerHeight
      const markerY = scrollContainer
        ? scrollContainer.getBoundingClientRect().top + Math.min(150, viewportHeight * 0.22)
        : 150

      if (scrollTop < viewportHeight - 96) {
        setActiveNavId('')
        return
      }

      const currentSection = navSections.find(({ id }) => {
        const section = document.getElementById(id)
        if (!section) return false
        const rect = section.getBoundingClientRect()

        return rect.top <= markerY && rect.bottom > markerY
      })

      setActiveNavId(currentSection?.navId || '')
    }

    const scrollContainer = isDesktopMobilePreview ? responsiveStageRef.current : null

    updateActiveNav()
    window.addEventListener('scroll', updateActiveNav, { passive: true })
    window.addEventListener('resize', updateActiveNav)
    scrollContainer?.addEventListener('scroll', updateActiveNav, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateActiveNav)
      window.removeEventListener('resize', updateActiveNav)
      scrollContainer?.removeEventListener('scroll', updateActiveNav)
    }
  }, [isDesktopMobilePreview])

  useEffect(() => {
    document.body.classList.toggle('mobile-preview-mode', previewMode === 'mobile')

    return () => {
      document.body.classList.remove('mobile-preview-mode')
    }
  }, [previewMode])

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateViewportSize()
    window.addEventListener('resize', updateViewportSize)

    return () => window.removeEventListener('resize', updateViewportSize)
  }, [])

  useLayoutEffect(() => {
    if (!isPhoneRatioLayout || !responsiveContentRef.current) {
      setScaledStageHeight(null)
      return undefined
    }

    const content = responsiveContentRef.current
    const updateStageHeight = () => {
      setScaledStageHeight(Math.ceil(content.scrollHeight * phoneStageScale))
    }
    const resizeObserver = new ResizeObserver(updateStageHeight)

    updateStageHeight()
    resizeObserver.observe(content)
    window.addEventListener('resize', updateStageHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateStageHeight)
    }
  }, [isPhoneRatioLayout, phoneStageScale])

  useEffect(() => {
    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 120)

    return () => window.clearTimeout(refreshTimer)
  }, [previewMode, scaledStageHeight])

  const phoneRatioStyle = isPhoneRatioLayout
    ? {
        '--phone-stage-width': `${mobileRatioDesignWidth}px`,
        '--phone-viewport-width': `${phoneViewportWidth}px`,
        '--phone-viewport-height': `${phoneViewportHeight}px`,
        '--phone-stage-scale': phoneStageScale,
        '--phone-design-height': `${phoneDesignHeight}px`,
        '--phone-stage-layout-height': scaledStageHeight ? `${scaledStageHeight}px` : 'auto',
      }
    : undefined

  return (
    <div
      ref={siteShellRef}
      className={`site-shell${isPhoneRatioLayout ? ' site-shell--phone-ratio' : ''}${isDesktopMobilePreview ? ' site-shell--mobile-simulator' : ''}`}
      style={phoneRatioStyle}
    >
      <div className="opening-animation" aria-hidden="true">
        <div className="opening-panel" />
        <div className="opening-mark">
          <span className="opening-mark__text">CHEN SONG / AI VISUAL PORTFOLIO</span>
          <span className="opening-mark__line" />
          <span className="opening-mark__line opening-mark__line--short" />
        </div>
      </div>
      <div className="preview-switcher" role="group" aria-label="预览模式切换">
        <button
          type="button"
          className={previewMode === 'desktop' ? 'preview-switcher__button is-active' : 'preview-switcher__button'}
          onClick={() => setPreviewMode('desktop')}
          aria-pressed={previewMode === 'desktop'}
          aria-label="桌面预览"
          title="桌面预览"
        >
          <span className="preview-switcher__icon preview-switcher__icon--desktop" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={previewMode === 'mobile' ? 'preview-switcher__button is-active' : 'preview-switcher__button'}
          onClick={() => setPreviewMode('mobile')}
          aria-pressed={previewMode === 'mobile'}
          aria-label="手机预览"
          title="手机预览"
        >
          <span className="preview-switcher__icon preview-switcher__icon--mobile" aria-hidden="true" />
        </button>
      </div>
      <div className="responsive-stage" ref={responsiveStageRef}>
      <div className="responsive-stage__content" ref={responsiveContentRef}>
      <header className="hero" id="home">
        <video
          ref={heroVideoRef}
          key={heroVideo}
          className="hero__video"
          style={{ objectPosition: heroVideoObjectPositions[heroVideo] || '62% center' }}
          autoPlay
          muted
          playsInline
          preload="metadata"
          aria-label="作品集首屏背景视频"
          onCanPlay={(event) => {
            event.currentTarget.play().catch(() => {})
          }}
          onEnded={playNextHeroVideo}
        >
          <source src={withBase(heroVideo)} type="video/mp4" />
        </video>
        <div className="hero__shade" />

        <nav className={`nav${isNavFloating ? ' nav--floating' : ''}`} aria-label="主导航">
          <a className="nav__brand" href="#home">
            CHEN SONG
          </a>
          <div className="nav__links">
            <a className={activeNavId === 'about' ? 'nav__link--active' : ''} href="#about">经历</a>
            <a className={activeNavId === 'portfolio' ? 'nav__link--active' : ''} href="#portfolio">作品集</a>
            <a className={activeNavId === 'strengths' ? 'nav__link--active' : ''} href="#strengths">优势</a>
            <a className={activeNavId === 'contact' ? 'nav__link--active' : ''} href="#contact">联系</a>
          </div>
          <a className="nav__contact" href="mailto:914228561s@gmail.com">
            联系我
          </a>
        </nav>

        <div className="container hero__content">
          <h1>
            <span className="hero__name-line">
              <span>陈松</span>
              <span className="hero__portfolio-label">作品集</span>
            </span>
            <span className="hero__role">AI Designer / AI Video Designer / 3D Designer</span>
            <span className="hero__statement">
              用技术与创意构建高转化视觉内容
              <br />
              以复盘与 SOP 提升团队内容生产效率
            </span>
          </h1>
          <p className="hero__copy">
            3.6 年视觉与内容制作经验，聚焦跨境电商广告素材、AI 视频内容、企业 AI 赋能与工作流搭建。擅长从运营需求出发完成卖点拆解、脚本分镜、AI 生图/生视频、剪辑包装、素材测试与复盘优化。
          </p>
          <div className="hero__actions">
            <a className="button button--light" href="#about">
              了解经历
            </a>
            <a className="button button--work" href="#projects">
              查看作品
            </a>
          </div>
        </div>

      </header>

      <main className="site-main">
        <div className="site-main__grainient" aria-hidden="true">
          {createElement(Grainient, {
            color1: '#410f18',
            color2: '#000000',
            color3: '#182e3e',
            timeSpeed: 0.18,
            colorBalance: 0.14,
            warpStrength: 0.78,
            warpFrequency: 4.4,
            warpSpeed: 0.7,
            warpAmplitude: 74,
            blendAngle: -14,
            blendSoftness: 0.16,
            rotationAmount: 280,
            noiseScale: 1.45,
            grainAmount: 0.08,
            grainScale: 2,
            contrast: 1.34,
            saturation: 0.42,
            centerX: 0.08,
            centerY: -0.12,
            zoom: 0.82,
          })}
        </div>
        <section className="section about" id="about">
          <div className="container about__grid">
            <div className="about__media">
              <img src={withBase('/images/avatar.png')} alt="陈松 3D 风格头像" draggable="false" />
              <div className="about__caption">
                <span>深圳 / 本科 / 视觉传达设计</span>
                <strong>求职方向：AI设计师、AI视频设计师</strong>
              </div>
            </div>

            <div className="about__content">
              <div className="about__profile">
                <p className="eyebrow">Profile</p>
                <h2>个人经历</h2>
                <p className="section-copy">
                  我具备 3D 视觉与 AI 视频制作复合背景，熟悉健康类跨境电商内容生产，能独立完成完整视频内容制作，并把个人经验沉淀为 SOP、素材规范和团队培训内容。
                </p>
                <div className="contact-strip about__tools" aria-label="常用工具">
                  <span>ComfyUI / ChatGPT / Gemini / Codex / Obsidian / Blender / AE</span>
                </div>
              </div>
            </div>
          </div>

          <div className="container metrics metrics--about">
            {metrics.map((item) => createElement(
              BorderGlow,
              {
                className: 'metric',
                key: item.label,
                edgeSensitivity: 56,
                glowRadius: 10,
                glowIntensity: 0.24,
                coneSpread: 11,
                fillOpacity: 0,
                colors: ['#eef4ef', '#9aa7a5', '#6f8587'],
              },
              <>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
                <p>{item.detail}</p>
              </>,
            ))}
          </div>

          <div className="container timeline" aria-label="工作经历时间线">
            {[...timeline].reverse().map((item) => createElement(
              BorderGlow,
              {
                className: 'timeline__item',
                key: `${item.time}-${item.role}`,
                edgeSensitivity: 38,
                glowRadius: 12,
                glowIntensity: 0.28,
                coneSpread: 12,
                fillOpacity: 0,
                colors: ['#eef4ef', '#9aa7a5', '#6f8587'],
              },
              <>
                <time>{item.time}</time>
                <div>
                  <h3>{item.role}</h3>
                  <p>{item.text}</p>
                </div>
              </>,
            ))}
          </div>
        </section>

        <section className="section projects" id="projects">
          <div className="container section-heading portfolio-heading" id="portfolio">
            <div className="portfolio-heading__main">
              <p className="eyebrow">Portfolio</p>
              <h2>作品集</h2>
              <p>围绕 AI 视频、3D 动画、产品视觉与真实素材混剪，展示可落地的内容生产能力。</p>
            </div>

            <div className="portfolio-heading__meta" aria-label="作品集概览">
              <span>
                <strong>{portfolioDisplayModules.length}</strong>
                组方向
              </span>
              <span>
                <strong>{portfolioTotalCount}</strong>
                件作品
              </span>
              <span>
                <strong>{portfolioVideoCount}</strong>
                条视频
              </span>
            </div>
          </div>

          <div className="portfolio-list">
            {portfolioDisplayModules.map((module, index) => createElement(
              Fragment,
              { key: module.folder },
              createElement(PortfolioCarouselSection, { module }),
              index < portfolioDisplayModules.length - 1
                ? createElement(PortfolioModuleDivider, {
                    currentIndex: index + 1,
                    nextModule: portfolioDisplayModules[index + 1],
                  })
                : null,
            ))}
          </div>
        </section>

        <section className="section strengths" id="strengths">
          <div className="container section-heading section-heading--compact strengths__header">
            <div>
              <p className="eyebrow">Strengths</p>
              <h2>个人优势</h2>
            </div>
          </div>

          <div className="container strengths__grid">
            {strengths.map((item, index) => (
              <article className="strength-card" key={item.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="contact" id="contact">
        <div className="container contact__inner">
          <p className="eyebrow">Contact</p>
          <h2>如果贵公司需要一位 AI 熟手来参与项目，我无疑是最好的选择。</h2>
          <p>
            如果贵公司看重 AI 视频生成、广告素材产出、视觉效果、跨工具整合或 SOP 落地能力，我的经验和学习能力可以让我快速进入项目，并把需求拆解成可执行的视觉内容，并在复盘中持续优化产出效率。
          </p>
          <div className="contact__links">
            <a href="mailto:914228561s@gmail.com">914228561s@gmail.com</a>
            <span>深圳</span>
            <span>AI设计师 / AI视频设计师 / 3D设计师</span>
          </div>
        </div>
      </footer>
      </div>
      </div>
    </div>
  )
}

export default App
