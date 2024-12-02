<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\UserIsGrantedResolver;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\RouterInterface;

class SiradelController extends AbstractController
{
    use ResolverTrait;

    public function __construct(private readonly UserUrlResolver $urlResolver, private readonly UserIsGrantedResolver $isGrantedResolver, private readonly RouterInterface $router, private readonly UserRepository $userRepository)
    {
    }

    /**
     * @Route("/webcomponenturls", name="web_component_urls", options={"i18n" = false})
     */
    public function getWebComponentUrls(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        try {
            $this->preventNullableViewer($user);
        } catch (\Exception) {
            return $this->json(['error' => 'not connected user'], 403);
        }

        $profileUrl = $this->urlResolver->__invoke($user);
        $analysisUrl = null;
        $adminUrl = $this->router->generate(
            'sonata_admin_dashboard',
            [],
            RouterInterface::ABSOLUTE_URL
        );
        if ($this->userRepository->isAssignedUsersOnProposal($user)) {
            $analysisUrl = $this->router->generate(
                'user_evaluations',
                [],
                RouterInterface::ABSOLUTE_URL
            );
        }

        $urls = [
            [
                'url' => $profileUrl,
                'labelFr' => 'Mon profil',
                'labelEn' => 'My profile',
            ],
        ];
        if ($user && $user->isAdmin() || $user->isProjectAdmin()) {
            $urls[] = [
                'url' => $adminUrl,
                'labelFr' => 'Administration',
                'labelEn' => 'Administration',
            ];
        }
        if ($user && $analysisUrl) {
            $urls[] = [
                'url' => $analysisUrl,
                'labelFr' => 'Mes analyses',
                'labelEn' => 'My analyses',
            ];
        }

        return $this->json(
            [
                'urls' => $urls,
            ],
            201
        );
    }
}
