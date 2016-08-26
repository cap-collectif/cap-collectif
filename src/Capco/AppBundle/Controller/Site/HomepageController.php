<?php

namespace Capco\AppBundle\Controller\Site;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Capco\AppBundle\Entity\NewsletterSubscription;
use Capco\AppBundle\Form\NewsletterSubscriptionType;
use Capco\AppBundle\Entity\Project;
use JMS\Serializer\SerializationContext;

class HomepageController extends Controller
{
    /**
     * @Route("/", name="app_homepage")
     * @Cache(smaxage="60", public=true)
     * @Template("CapcoAppBundle:Homepage:homepage.html.twig")
     */
    public function homepageAction(Request $request)
    {
        $sections = $this->get('capco.section.resolver')->getDisplayableEnabledOrdered();
        $newsletterActive = $this->get('capco.toggle.manager')->isActive('newsletter');

        // Subscription to newsletter
        if ($newsletterActive) {
            $subscription = new NewsletterSubscription();

            $form = $this->createForm(NewsletterSubscriptionType::class, $subscription);
            $form->handleRequest($request);

            if ($form->isSubmitted()) {
                $flashBag = $this->get('session')->getFlashBag();
                $translator = $this->get('translator');
                $em = $this->getDoctrine()->getManager();

                if ($form->isValid()) {
                    // TODO: move this to a unique constraint in form instead
                    $email = $em->getRepository('CapcoAppBundle:NewsletterSubscription')
                                ->findOneByEmail($subscription->getEmail());

                    if ($email) {
                        $flashBag->add('info', $translator->trans('homepage.newsletter.already_subscribed'));
                    } else {
                        $em->persist($subscription);
                        $em->flush();
                        $flashBag->add('success', $translator->trans('homepage.newsletter.success'));
                    }
                } else {
                    $flashBag->add('danger', $translator->trans('homepage.newsletter.invalid'));
                }

                return $this->redirect($this->generateUrl('app_homepage'));
            }
        }

        return [
            'form' => $newsletterActive ? $form->createView() : false,
            'sections' => $sections,
        ];
    }

    /**
     * @Template("CapcoAppBundle:Homepage:highlighted.html.twig")
     */
    public function highlightedContentAction($max = 4, $offset = 0, $section = null, $alt = null)
    {
        $highlighteds = $this->getDoctrine()->getRepository('CapcoAppBundle:HighlightedContent')->getAllOrderedByPosition(5);

        return [
            'highlighteds' => $highlighteds,
            'section' => $section,
            'alt' => $alt,
        ];
    }

    /**
     * @Template("CapcoAppBundle:Homepage:videos.html.twig")
     */
    public function lastVideosAction($max = 4, $offset = 0, $section = null, $alt = null)
    {
        $videos = $this->get('capco.video.repository')->getLast($max, $offset);

        return [
            'videos' => $videos,
            'section' => $section,
            'alt' => $alt,
        ];
    }

    /**
     * @Cache(smaxage="60", public=true)
     * @Template("CapcoAppBundle:Homepage:lastIdeas.html.twig")
     */
    public function popularIdeasAction($max = 4, $offset = 0, $section = null, $alt = null)
    {
        $serializer = $this->get('jms_serializer');
        $ideasRaw = $this->getDoctrine()->getRepository('CapcoAppBundle:Idea')->getPopular($max, $offset);
        $props = $serializer->serialize([
            'ideas' => $ideasRaw,
        ], 'json', SerializationContext::create()->setGroups(['Ideas', 'ThemeDetails', 'UsersInfos']));

        return [
            'props' => $props,
            'nbIdeas' => count($ideasRaw),
            'section' => $section,
            'alt' => $alt,
        ];
    }

    /**
     * @Cache(smaxage="60", public=true)
     * @Template("CapcoAppBundle:Homepage:lastIdeas.html.twig")
     */
    public function lastIdeasAction($max = 4, $offset = 0, $section = null, $alt = null)
    {
        $serializer = $this->get('jms_serializer');
        $ideasRaw = $this->getDoctrine()->getRepository('CapcoAppBundle:Idea')->getLast($max, $offset);
        $props = $serializer->serialize([
            'ideas' => $ideasRaw,
        ], 'json', SerializationContext::create()->setGroups(['Ideas', 'Themes', 'UsersInfos']));

        return [
            'props' => $props,
            'nbIdeas' => count($ideasRaw),
            'section' => $section,
            'alt' => $alt,
        ];
    }

    /**
     * @Cache(smaxage="60", public=true)
     * @Template("CapcoAppBundle:Homepage:lastProposals.html.twig")
     */
    public function lastProposalsAction($max = 4, $offset = 0, $section = null, $alt = null)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        if ($section->getStep() && $section->getStep()->isCollectStep()) {
            $proposals = $em
                ->getRepository('CapcoAppBundle:Proposal')
                ->getLastByStep($max, $offset, $section->getStep())
            ;
        } else {
            $proposals = $em
                ->getRepository('CapcoAppBundle:Proposal')
                ->getLast($max, $offset)
            ;
        }

        return [
            'proposals' => $proposals,
            'section' => $section,
            'alt' => $alt,
        ];
    }

    /**
     * @Cache(smaxage="60", public=true)
     * @Template("CapcoAppBundle:Homepage:lastThemes.html.twig")
     */
    public function lastThemesAction($max = 4, $offset = 0, $section = null, $alt = null)
    {
        $topics = $this->getDoctrine()->getRepository('CapcoAppBundle:Theme')->getLast($max, $offset);

        return [
            'topics' => $topics,
            'section' => $section,
            'alt' => $alt,
        ];
    }

    /**
     * @Cache(smaxage="60", public=true)
     * @Template("CapcoAppBundle:Homepage:lastPosts.html.twig")
     */
    public function lastPostsAction($max = 3, $offset = 0, $section = null, $alt = null)
    {
        $posts = $this->get('capco.blog.post.repository')->getLast($max, $offset);

        return [
            'posts' => $posts,
            'section' => $section,
            'alt' => $alt,
        ];
    }

    /**
     * @Cache(smaxage="60", public=true)
     * @Template("CapcoAppBundle:Homepage:lastProjects.html.twig")
     *
     * @param int  $max
     * @param int  $offset
     * @param null $section
     * @param null $alt
     *
     * @return array
     */
    public function lastProjectsAction($max = 3, $offset = 0, $section = null, $alt = null)
    {
        $serializer = $this->get('jms_serializer');
        $count = $this->get('doctrine.orm.entity_manager')->getRepository('CapcoAppBundle:Project')->countPublished();
        $props = $serializer->serialize([
            'projects' => $this
                ->get('doctrine.orm.entity_manager')
                ->getRepository('CapcoAppBundle:Project')
                ->getLastPublished($max, $offset),
        ], 'json', SerializationContext::create()->setGroups(['Projects', 'Steps', 'Themes']));

        return [
            'max' => $max,
            'props' => $props,
            'count' => $count,
            'section' => $section,
            'alt' => $alt,
        ];
    }

    /**
     * @Cache(smaxage="60", public=true)
     *
     * @param $max
     * @param $offset
     *
     * @return array
     * @Template("CapcoAppBundle:Homepage:lastEvents.html.twig")
     */
    public function lastEventsAction($max = 3, $offset = 0, $section = null, $alt = null)
    {
        $events = $this->get('capco.event.repository')->getLast($max, $offset);

        return [
            'events' => $events,
            'section' => $section,
            'alt' => $alt,
        ];
    }

    /**
     * @Template("CapcoAppBundle:Homepage:socialNetworks.html.twig")
     */
    public function socialNetworksAction($section = null, $alt = null)
    {
        $socialNetworks = $this->getDoctrine()->getRepository('CapcoAppBundle:SocialNetwork')->getEnabled();

        return [
            'socialNetworks' => $socialNetworks,
            'section' => $section,
            'alt' => $alt,
        ];
    }
}
