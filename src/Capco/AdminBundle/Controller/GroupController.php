<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Command\Service\FilePathResolver\UserGroupsFilePathResolver;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Routing\Annotation\Route;

class GroupController extends AbstractController
{
    public function __construct(
        private readonly KernelInterface $kernel,
        private readonly UserGroupsFilePathResolver $userGroupsFilePathResolver
    ) {
    }

    /**
     * @Route("/export-user-groups", name="app_user_groups_export")
     * @Security("is_granted('ROLE_ADMIN')")
     */
    public function exportAction(Request $request): Response
    {
        $exportPath = $this->userGroupsFilePathResolver->getExportPath();
        $filename = 'user_groups.csv';

        $application = new Application($this->kernel);
        $application->setAutoExit(false);

        $input = new ArrayInput(['command' => 'capco:export:user-groups']);
        $application->run($input);

        $absolutePath = $exportPath;
        $contentType = 'text/csv';

        $response = $this->file($absolutePath, $filename);
        $response->headers->set('Content-Type', $contentType . '; charset=utf-8');

        return $response;
    }
}
