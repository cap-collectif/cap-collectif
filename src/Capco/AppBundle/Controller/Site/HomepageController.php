<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\NewsletterSubscription;
use Capco\AppBundle\Enum\DeleteAccountType;
use Capco\AppBundle\Form\NewsletterSubscriptionType;
use Capco\AppBundle\GraphQL\Resolver\Query\QueryEventsResolver;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Capco\AppBundle\Resolver\SectionResolver;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

class HomepageController extends Controller
{
    private QueryEventsResolver $eventsResolver;
    private SectionResolver $sectionResolver;
    private Manager $manager;
    private TranslatorInterface $translator;
    private NewsletterSubscriptionRepository $newsletterSubscriptionRepository;
    private UserRepository $userRepository;

    public function __construct(
        QueryEventsResolver $eventsResolver,
        SectionResolver $sectionResolver,
        Manager $manager,
        TranslatorInterface $translator,
        NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        UserRepository $userRepository
    ) {
        $this->eventsResolver = $eventsResolver;
        $this->sectionResolver = $sectionResolver;
        $this->manager = $manager;
        $this->translator = $translator;
        $this->newsletterSubscriptionRepository = $newsletterSubscriptionRepository;
        $this->userRepository = $userRepository;
    }

    /**
     * @Route("/", name="app_homepage")
     * @Template("CapcoAppBundle:Homepage:homepage.html.twig")
     */
    public function homepageAction(Request $request)
    {
        $locale = $request->getLocale();
        $sections = $this->sectionResolver->getDisplayableEnabledOrdered();
        $eventsCount = $this->eventsResolver
            ->getEventsConnection(
                new Argument(['isFuture' => true, 'first' => 0, 'locale' => $locale])
            )
            ->getTotalCount();

        $newsletterActive = $this->manager->isActive('newsletter');

        $deleteType = $request->get('deleteType');
        $form = null;

        if ($deleteType) {
            $flashBag = $this->get('session')->getFlashBag();
            if (DeleteAccountType::SOFT === $deleteType) {
                $flashBag->add(
                    'success',
                    $this->translator->trans('account-and-contents-anonymized')
                );
            } elseif (DeleteAccountType::HARD === $deleteType) {
                $flashBag->add('success', $this->translator->trans('account-and-contents-deleted'));
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
                    $email = $this->newsletterSubscriptionRepository->findOneByEmail(
                        $subscription->getEmail()
                    );
                    /** @var User $userToNotify */
                    $userToNotify = $this->userRepository->findOneBy([
                        'email' => $subscription->getEmail(),
                    ]);
                    $em = $this->getDoctrine()->getManager();

                    if ($userToNotify) {
                        $userNotification = $userToNotify->getNotificationsConfiguration();
                        if (!$userNotification->isConsentExternalCommunication()) {
                            $userToNotify->setNotificationsConfiguration(
                                $userNotification->setConsentExternalCommunication(true)
                            );
                            $flashBag->add(
                                'success',
                                $this->translator->trans('homepage.newsletter.success')
                            );
                            $em->persist($userToNotify);
                        } elseif ($userNotification->isConsentExternalCommunication()) {
                            $flashBag->add(
                                'info',
                                $this->translator->trans('homepage.newsletter.already_subscribed')
                            );
                        }
                    } elseif (!$email) {
                        $em->persist($subscription);
                        $flashBag->add(
                            'success',
                            $this->translator->trans('homepage.newsletter.success')
                        );
                    } elseif ($email) {
                        if ($email->getIsEnabled()) {
                            $flashBag->add(
                                'info',
                                $this->translator->trans('homepage.newsletter.already_subscribed')
                            );
                        } else {
                            $email->setIsEnabled(true);
                            $em->persist($email);
                            $flashBag->add(
                                'success',
                                $this->translator->trans('homepage.newsletter.success')
                            );
                        }
                    }

                    $em->flush();
                } else {
                    $flashBag->add(
                        'danger',
                        $this->translator->trans('homepage.newsletter.invalid')
                    );
                }

                return $this->redirect($this->generateUrl('app_homepage'));
            }
        }

        return [
            'form' => $newsletterActive ? $form->createView() : false,
            'sections' => $sections,
            'eventsCount' => $eventsCount,
        ];
    }
}
