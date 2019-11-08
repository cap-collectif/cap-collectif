<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Resolver\StepResolver;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Repository\PostRepository;
use Symfony\Component\Routing\RouterInterface;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Repository\ThemeRepository;
use Symfony\Component\Routing\Annotation\Route;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Capco\AppBundle\GraphQL\Resolver\Step\StepUrlResolver;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class SitemapsController extends Controller
{
    /**
     * @Route("/sitemap.{_format}", name="app_sitemap", requirements={"_format" = "xml"})
     * @Template("CapcoAppBundle:Sitemaps:sitemap.xml.twig")
     */
    public function sitemapAction(): array
    {
        $toggleManager = $this->get(Manager::class);

        if ($toggleManager->isActive('shield_mode')) {
            throw $this->createAccessDeniedException();
        }

        $em = $this->getDoctrine()->getManager();
        $urls = [];
        $hostname = $this->get('request_stack')
            ->getCurrentRequest()
            ->getHost();

        // Homepage
        $urls[] = [
            'loc' => $this->get('router')->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL),
            'changefreq' => 'weekly',
            'priority' => '1.0'
        ];

        // Contact
        $urls[] = [
            'loc' => $this->get('router')->generate('app_contact', [], RouterInterface::ABSOLUTE_URL),
            'changefreq' => 'yearly',
            'priority' => '0.1'
        ];

        // Pages
        foreach (
            $em->getRepository('CapcoAppBundle:Page')->findBy(['isEnabled' => true])
            as $page
        ) {
            $urls[] = [
                'loc' => $this->get('router')->generate('app_page_show', [
                    'slug' => $page->getSlug()
                ], RouterInterface::ABSOLUTE_URL),
                'lastmod' => $page->getLastModifiedAt()->format(\DateTime::W3C),
                'changefreq' => 'monthly',
                'priority' => '0.1'
            ];
        }

        // Themes
        if ($toggleManager->isActive('themes')) {
            $urls[] = [
                'loc' => $this->get('router')->generate('app_theme', [], RouterInterface::ABSOLUTE_URL),
                'changefreq' => 'weekly',
                'priority' => '0.5'
            ];
            foreach ($this->get(ThemeRepository::class)->findBy(['isEnabled' => true]) as $theme) {
                $urls[] = [
                    'loc' => $this->get('router')->generate('app_theme_show', [
                        'slug' => $theme->getSlug()
                    ], RouterInterface::ABSOLUTE_URL),
                    'lastmod' => $theme->getLastModifiedAt()->format(\DateTime::W3C),
                    'changefreq' => 'weekly',
                    'priority' => '0.5'
                ];
            }
        }

        // Blog
        if ($toggleManager->isActive('blog')) {
            $urls[] = [
                'loc' => $this->get('router')->generate('app_blog', [], RouterInterface::ABSOLUTE_URL),
                'changefreq' => 'daily',
                'priority' => '1.0'
            ];
            foreach ($this->get(PostRepository::class)->findBy(['isPublished' => true]) as $post) {
                $urls[] = [
                    'loc' => $this->get('router')->generate('app_blog_show', [
                        'slug' => $post->getSlug()
                    ], RouterInterface::ABSOLUTE_URL),
                    'lastmod' => $post->getLastModifiedAt()->format(\DateTime::W3C),
                    'changefreq' => 'daily',
                    'priority' => '1.0'
                ];
            }
        }

        // Events
        if ($toggleManager->isActive('calendar')) {
            $urls[] = [
                'loc' => $this->get('router')->generate('app_event', [], RouterInterface::ABSOLUTE_URL),
                'changefreq' => 'daily',
                'priority' => '1.0'
            ];
            /** @var Event $event */
            foreach ($this->get(EventRepository::class)->findBy(['enabled' => true]) as $event) {
                $urls[] = [
                    'loc' => $this->get('router')->generate('app_event_show', [
                        'slug' => $event->getSlug()
                    ], RouterInterface::ABSOLUTE_URL),
                    'priority' => '1.0',
                    'lastmod' => $event->getLastModifiedAt()->format(\DateTime::W3C),
                    'changefreq' => 'daily'
                ];
            }
        }

        // Projects
        $urls[] = [
            'loc' => $this->get('router')->generate('app_project', [], RouterInterface::ABSOLUTE_URL),
            'changefreq' => 'weekly',
            'priority' => '0.5'
        ];

        $stepUrlResolver = $this->get(StepUrlResolver::class);
        $stepRepository = $this->get(AbstractStepRepository::class);
        /** @var AbstractStep $step */
        foreach (
            $stepRepository ->findBy(['isEnabled' => true])
            as $step
        ) {
            if ($step->getProject() && $step->getProject()->isPublic()) {
                $urls[] = [
                    'loc' => $stepUrlResolver->__invoke($step),
                    'priority' => '0.5',
                    'lastmod' => $step->getLastModifiedAt()->format(\DateTime::W3C),
                    'changefreq' => 'weekly'
                ];
            }
        }

        return ['urls' => $urls, 'hostname' => $hostname];
    }
}
