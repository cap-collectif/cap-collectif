<?php

declare(strict_types=1);

/*
 * This file is a copy/paste with some modifications of the original DashboardAction
 * from Sonata, to allow redirect based on user role on the admin dashboard page
 */

namespace Capco\AdminBundle\Action;

use Twig\Environment;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Enum\UserRole;
use Sonata\AdminBundle\Admin\Pool;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Sonata\AdminBundle\Admin\BreadcrumbsBuilderInterface;
use Sonata\AdminBundle\Templating\TemplateRegistryInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

final class DashboardAction
{
    private $dashboardBlocks = [];
    private $breadcrumbsBuilder;
    private $templateRegistry;
    private $pool;
    private $twig;
    private TokenStorageInterface $tokenStorage;
    private $router;

    public function __construct(
        array $dashboardBlocks,
        BreadcrumbsBuilderInterface $breadcrumbsBuilder,
        TemplateRegistryInterface $templateRegistry,
        Pool $pool,
        Environment $twig,
        TokenStorageInterface $tokenStorage,
        RouterInterface $router
    ) {
        $this->dashboardBlocks = $dashboardBlocks;
        $this->breadcrumbsBuilder = $breadcrumbsBuilder;
        $this->templateRegistry = $templateRegistry;
        $this->pool = $pool;
        $this->twig = $twig;
        $this->tokenStorage = $tokenStorage;
        $this->router = $router;
    }

    public function __invoke(Request $request): Response
    {
        $token = $this->tokenStorage->getToken();
        if (
            $token &&
            $token->getUser() instanceof User &&
            $token->getUser()->hasRole(UserRole::ROLE_PROJECT_ADMIN) &&
            (!$token->getUser()->hasRole(UserRole::ROLE_ADMIN) ||
                !$token->getUser()->hasRole(UserRole::ROLE_SUPER_ADMIN))
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
