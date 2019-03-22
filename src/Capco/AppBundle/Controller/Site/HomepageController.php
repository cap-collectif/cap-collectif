<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\NewsletterSubscription;
use Capco\AppBundle\Entity\Section;
use Capco\AppBundle\Entity\UserNotificationsConfiguration;
use Capco\AppBundle\Form\NewsletterSubscriptionType;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Repository\HighlightedContentRepository;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Capco\AppBundle\Repository\PostRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\Repository\VideoRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Capco\AppBundle\Resolver\SectionResolver;
use Symfony\Component\Serializer\SerializerInterface;

class HomepageController extends Controller
{
    private $serializer;

    public function __construct(SerializerInterface $serializer)
    {
        $this->serializer = $serializer;
    }

    /**
     * @Route("/", name="app_homepage")
     * @Template("CapcoAppBundle:Homepage:homepage.html.twig")
     */
    public function homepageAction(Request $request)
    {
        $sections = $this->get(SectionResolver::class)->getDisplayableEnabledOrdered();
        $newsletterActive = $this->get(Manager::class)->isActive('newsletter');

        $translator = $this->get('translator');
        $deleteType = $request->get('deleteType');
        $form = null;

        if ($deleteType) {
            $flashBag = $this->get('session')->getFlashBag();
            if ('SOFT' === $deleteType) {
                $flashBag->add('success', $translator->trans('account-and-contents-anonymized'));
            } elseif ('HARD' === $deleteType) {
                $flashBag->add('success', $translator->trans('account-and-contents-deleted'));
            }
        }

        // Subscription to newsletter
        if ($newsletterActive) {
            $subscription = new NewsletterSubscription();

            $form = $this->createForm(NewsletterSubscriptionType::class, $subscription);
            $form->handleRequest($request);

            if ($form->isSubmitted()) {
                // We create a session only if form is submitted
                $flashBag = $this->get('session')->getFlashBag();
                if ($form->isValid()) {
                    // TODO: move this to a unique constraint in form instead
                    /** @var NewsletterSubscription $email */
                    $email = $this->get(NewsletterSubscriptionRepository::class)->findOneByEmail(
                        $subscription->getEmail()
                    );
                    /** @var User $userToNotify */
                    $userToNotify = $this->get(UserRepository::class)->findOneBy([
                        'email' => $subscription->getEmail(),
                    ]);
                    $em = $this->getDoctrine()->getManager();

                    if ($userToNotify) {
                        /** @var UserNotificationsConfiguration $userNotification */
                        $userNotification = $userToNotify->getNotificationsConfiguration();
                        if (!$userNotification->isConsentExternalCommunication()) {
                            $userToNotify->setNotificationsConfiguration(
                                $userNotification->setConsentExternalCommunication(true)
                            );
                            $flashBag->add(
                                'success',
                                $translator->trans('homepage.newsletter.success')
                            );
                            $em->persist($userToNotify);
                        } elseif ($userNotification->isConsentExternalCommunication()) {
                            $flashBag->add(
                                'info',
                                $translator->trans('homepage.newsletter.already_subscribed')
                            );
                        }
                    } elseif (!$email) {
                        $em->persist($subscription);
                        $flashBag->add(
                            'success',
                            $translator->trans('homepage.newsletter.success')
                        );
                    } elseif ($email) {
                        if ($email->getIsEnabled()) {
                            $flashBag->add(
                                'info',
                                $translator->trans('homepage.newsletter.already_subscribed')
                            );
                        } else {
                            $email->setIsEnabled(true);
                            $em->persist($email);
                            $flashBag->add(
                                'success',
                                $translator->trans('homepage.newsletter.success')
                            );
                        }
                    }

                    $em->flush();
                } else {
                    $flashBag->add('danger', $translator->trans('homepage.newsletter.invalid'));
                }

                return $this->redirect($this->generateUrl('app_homepage'));
            }
        }

        return ['form' => $newsletterActive ? $form->createView() : false, 'sections' => $sections];
    }

    /**
     * @Template("CapcoAppBundle:Homepage:highlighted.html.twig")
     */
    public function highlightedContentAction(Section $section = null)
    {
        $highlighteds = $this->get(HighlightedContentRepository::class)->getAllOrderedByPosition(4);
        $props = $this->serializer->serialize(['highlighteds' => $highlighteds], 'json', [
            'groups' => [
                'HighlightedContent',
                'Posts',
                'Events',
                'Projects',
                'Themes',
                'ThemeDetails',
                'Default',
                'Proposals',
            ],
        ]);

        return ['props' => $props, 'section' => $section];
    }

    /**
     * @Template("CapcoAppBundle:Homepage:videos.html.twig")
     */
    public function lastVideosAction(int $max = null, int $offset = null, Section $section = null)
    {
        $max = $max ?? 4;
        $offset = $offset ?? 0;
        $videos = $this->get(VideoRepository::class)->getLast($max, $offset);

        return ['videos' => $videos, 'section' => $section];
    }

    /**
     * @Template("CapcoAppBundle:Homepage:lastProposals.html.twig")
     */
    public function lastProposalsAction(
        ?int $max = null,
        ?int $offset = null,
        ?Section $section = null
    ) {
        $max = $max ?? 4;
        $offset = $offset ?? 0;
        if ($section->getStep() && $section->getStep()->isCollectStep()) {
            $proposals = $this->get(ProposalRepository::class)->getLastByStep(
                $max,
                $offset,
                $section->getStep()
            );
        } else {
            $proposals = $this->get(ProposalRepository::class)->getLast($max, $offset);
        }

        return ['proposals' => $proposals, 'section' => $section];
    }

    /**
     * @Template("CapcoAppBundle:Homepage:lastThemes.html.twig")
     */
    public function lastThemesAction(
        ?int $max = null,
        ?int $offset = null,
        ?Section $section = null
    ) {
        $max = $max ?? 4;
        $offset = $offset ?? 0;
        $topics = $this->get(ThemeRepository::class)->getLast($max, $offset);

        return ['topics' => $topics, 'section' => $section];
    }

    /**
     * @Template("CapcoAppBundle:Homepage:lastPosts.html.twig")
     */
    public function lastPostsAction(int $max = null, int $offset = null, Section $section = null)
    {
        $max = $max ?? 4;
        $offset = $offset ?? 0;
        $posts = $this->get(PostRepository::class)->getLast($max, $offset);

        return ['posts' => $posts, 'section' => $section];
    }

    /**
     * @Template("CapcoAppBundle:Homepage:lastProjects.html.twig")
     */
    public function lastProjectsAction(int $max = null, int $offset = null, Section $section = null)
    {
        $max = $max ?? 3;
        $projectRepo = $this->get(ProjectRepository::class);
        $count = $projectRepo->countPublished($this->getUser());

        return ['max' => $max, 'count' => $count, 'section' => $section];
    }

    /**
     * @Template("CapcoAppBundle:Homepage:lastEvents.html.twig")
     */
    public function lastEventsAction(int $max = null, int $offset = null, Section $section = null)
    {
        $max = $max ?? 3;
        $offset = $offset ?? 0;
        $events = $this->get(EventRepository::class)->getLast($max, $offset);

        return ['events' => $events, 'section' => $section];
    }

    /**
     * @Template("CapcoAppBundle:Homepage:socialNetworks.html.twig")
     */
    public function socialNetworksAction(Section $section = null)
    {
        $socialNetworks = $this->getDoctrine()
            ->getManager()
            ->getRepository('CapcoAppBundle:SocialNetwork')
            ->getEnabled();

        return ['socialNetworks' => $socialNetworks, 'section' => $section];
    }
}
