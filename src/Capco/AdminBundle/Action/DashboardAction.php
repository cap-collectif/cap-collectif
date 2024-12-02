<?php

declare(strict_types=1);

/*
 * This file is a copy/paste with some modifications of the original DashboardAction
 * from Sonata, to allow redirect based on user role on the admin dashboard page
 */

namespace Capco\AdminBundle\Action;

use Capco\AppBundle\Enum\UserRole;
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
    public function __construct(private readonly array $dashboardBlocks, private readonly BreadcrumbsBuilderInterface $breadcrumbsBuilder, private readonly TemplateRegistryInterface $templateRegistry, private readonly Pool $pool, private readonly Environment $twig, private readonly TokenStorageInterface $tokenStorage, private readonly RouterInterface $router)
    {
    }

    public function __invoke(Request $request): Response
    {
        $token = $this->tokenStorage->getToken();
        if (
            $token
            && $token->getUser() instanceof User
            && $token->getUser()->hasRole(UserRole::ROLE_PROJECT_ADMIN)
            && (!$token->getUser()->hasRole(UserRole::ROLE_ADMIN)
                || !$token->getUser()->hasRole(UserRole::ROLE_SUPER_ADMIN))
        ) {
            return new RedirectResponse(
                $this->router->generate('app_homepage', [], UrlGeneratorInterface::ABSOLUTE_URL) .
                    'admin-next/projects'
            );
        }
        $blocks = [
            'top' => [],
            'left' => [],
            'center' => [],
            'right' => [],
            'bottom' => [],
        ];

        foreach ($this->dashboardBlocks as $block) {
            $blocks[$block['position']][] = $block;
        }

        $parameters = [
            'base_template' => $request->isXmlHttpRequest()
                ? $this->templateRegistry->getTemplate('ajax')
                : $this->templateRegistry->getTemplate('layout'),
            'admin_pool' => $this->pool,
            'blocks' => $blocks,
        ];

        if (!$request->isXmlHttpRequest()) {
            $parameters['breadcrumbs_builder'] = $this->breadcrumbsBuilder;
        }

        return new Response(
            $this->twig->render($this->templateRegistry->getTemplate('dashboard'), $parameters)
        );
    }
}
