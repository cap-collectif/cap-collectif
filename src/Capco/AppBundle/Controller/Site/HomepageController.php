<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Enum\DeleteAccountType;
use Capco\AppBundle\GraphQL\Resolver\Query\QueryEventsResolver;
use Capco\AppBundle\Resolver\SectionResolver;
use Capco\AppBundle\Service\Encryptor;
use Capco\AppBundle\Service\ParticipationWorkflow\ParticipationCookieManager;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

class HomepageController extends Controller
{
    public function __construct(
        private readonly QueryEventsResolver $eventsResolver,
        private readonly SectionResolver $sectionResolver,
        private readonly TranslatorInterface $translator,
        private readonly Encryptor $encryptor
    ) {
    }

    /**
     * @Route("/", name="app_homepage")
     */
    public function homepageAction(Request $request): Response
    {
        $locale = $request->getLocale();
        $sections = $this->sectionResolver->getDisplayableEnabledOrdered();
        $eventsCount = $this->eventsResolver
            ->getEventsConnection(
                new Argument(['isFuture' => true, 'first' => 0, 'locale' => $locale])
            )
            ->getTotalCount()
        ;

        $deleteType = $request->get('deleteType');

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

        $response = $this->render('@CapcoApp/Homepage/homepage.html.twig', [
            'sections' => $sections,
            'eventsCount' => $eventsCount,
        ]);

        $this->addParticipationCookies($request, $response);

        return $response;
    }

    private function addParticipationCookies(Request $request, Response $response): void
    {
        $participationCookies = $request->get('participationCookies');

        if (!$participationCookies) {
            return;
        }

        $decryptedParticipationCookies = $this->encryptor->decryptData($participationCookies);
        $cookies = json_decode($decryptedParticipationCookies, true);

        $decryptedReplyCookie = ($cookies['replyCookie'] ?? null) ? $this->encryptor->decryptData($cookies['replyCookie']) : null;
        $decryptedParticipantCookie = ($cookies['participantCookie'] ?? null) ? $this->encryptor->decryptData($cookies['participantCookie']) : null;

        if ($decryptedReplyCookie) {
            $replyCookie = Cookie::create(ParticipationCookieManager::REPLY_COOKIE, $decryptedReplyCookie, (new \DateTime())->modify('+1 year'), null, null, false, false);
            $response->headers->setCookie($replyCookie);
        }

        if ($decryptedParticipantCookie) {
            $participantCookie = Cookie::create(ParticipationCookieManager::PARTICIPANT_COOKIE, $decryptedParticipantCookie, (new \DateTime())->modify('+1 year'), null, null, false, false);
            $response->headers->setCookie($participantCookie);
        }
    }
}
