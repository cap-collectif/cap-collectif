<?php

declare(strict_types=1);

/*
 * This file is a copy/paste with some modifications of the original DashboardAction
 * from Sonata, to allow redirect based on user role on the admin dashboard page
 */

namespace Capco\AdminBundle\Action;

use Capco\UserBundle\Entity\User;
use Sonata\AdminBundle\Admin\BreadcrumbsBuilderInterface;
use Sonata\AdminBundle\Admin\Pool;
use Sonata\AdminBundle\Templating\TemplateRegistryInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Twig\Environment;

final class DashboardAction
{
    public function __construct(
        /** @phpstan-ignore-next-line */
        private readonly array $dashboardBlocks,
        /** @phpstan-ignore-next-line */
        private readonly BreadcrumbsBuilderInterface $breadcrumbsBuilder,
        /** @phpstan-ignore-next-line */
        private readonly TemplateRegistryInterface $templateRegistry,
        /** @phpstan-ignore-next-line */
        private readonly Pool $pool,
        /** @phpstan-ignore-next-line */
        private readonly Environment $twig,
        private readonly TokenStorageInterface $tokenStorage,
        private readonly RouterInterface $router
    ) {
    }

    public function __invoke(Request $request): Response
    {
        $token = $this->tokenStorage->getToken();
        $user = $token->getUser();

        if ($user instanceof User && $user->hasBackOfficeAccess()) {
            return new RedirectResponse(
                $this->router->generate('app_homepage', [], UrlGeneratorInterface::ABSOLUTE_URL) .
                    'admin-next/projects'
            );
        }

        return new RedirectResponse(
            $this->router->generate('app_homepage', [], UrlGeneratorInterface::ABSOLUTE_URL)
        );
    }
}
