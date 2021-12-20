<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\UserIsGrantedResolver;
use Capco\UserBundle\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\RouterInterface;

class SiradelController extends AbstractController
{
    use ResolverTrait;
    private UserUrlResolver $urlResolver;
    private UserIsGrantedResolver $isGrantedResolver;
    private RouterInterface $router;
    private UserRepository $userRepository;

    public function __construct(
        UserUrlResolver $urlResolver,
        UserIsGrantedResolver $isGrantedResolver,
        RouterInterface $router,
        UserRepository $userRepository
    ) {
        $this->urlResolver = $urlResolver;
        $this->isGrantedResolver = $isGrantedResolver;
        $this->router = $router;
        $this->userRepository = $userRepository;
    }

    /**
     * @Route("/webcomponenturls", name="web_component_urls", options={"i18n" = false})
     */
    public function getWebComponentUrls(Request $request): JsonResponse
    {
        $user = $this->getUser();

        try {
            $this->preventNullableViewer($user);
        } catch (\Exception $exception) {
            return $this->json(['error' => 'not connected user'], 403);
        }

        $profileUrl = $this->urlResolver->__invoke($user);
        $adminUrl = $analysisUrl = null;
        if ($this->isGrantedResolver->isGranted($user)) {
            $adminUrl = $this->router->generate(
                'sonata_admin_dashboard',
                [],
                RouterInterface::ABSOLUTE_URL
            );
        }
        if ($this->userRepository->isAssignedUsersOnProposal($user) || $user->isProjectAdmin()) {
            $analysisUrl = $this->router->generate(
                'user_evaluations',
                [],
                RouterInterface::ABSOLUTE_URL
            );
        }

        return $this->json(
            [
                'urls' => [
                    [
                        'url' => $profileUrl,
                        'labelFr' => 'Mon profil',
                        'labelEn' => 'My profile',
                    ],
                    [
                        'url' => $adminUrl,
                        'labelFr' => 'Administration',
                        'labelEn' => 'Administration',
                    ],
                    [
                        'url' => $analysisUrl,
                        'labelFr' => 'Mes analyses',
                        'labelEn' => 'My analyses',
                    ],
                ],
            ],
            201
        );
    }
}
