<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Command\CreateCsvFromLegacyUsersCommand;
use Capco\AppBundle\Command\Service\CronTimeInterval;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Repository\UserRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sonata\AdminBundle\Admin\BreadcrumbsBuilderInterface;
use Sonata\AdminBundle\Admin\Pool;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * @Security("has_role('ROLE_ADMIN')")
 */
class UserController extends CRUDController
{
    private CronTimeInterval $cronTimeInterval;
    private SessionInterface $session;

    public function __construct(
        BreadcrumbsBuilderInterface $breadcrumbsBuilder,
        Pool $pool,
        CronTimeInterval $cronTimeInterval,
        SessionInterface $session
    ) {
        $this->cronTimeInterval = $cronTimeInterval;
        $this->session = $session;
        parent::__construct($breadcrumbsBuilder, $pool);
    }

    public function editAction($id = null): Response
    {
        $object = $this->get(UserRepository::class)->find($id);

        if (!$object) {
            throw $this->createNotFoundException('The user corresponding to this id doesn\'t exist.');
        }

        return $this->renderWithExtraParams(
            'CapcoAdminBundle:User:edit.html.twig',
            [
                'action' => 'edit',
                'form' => null,
                'object' => $object,
                'objectId' => $object->getId(),
            ],
            null
        );
    }

    public function exportAction(Request $request): Response
    {
        $this->admin->checkAccess('export');

        $path = $this->container->getParameter('kernel.root_dir') . '/../public/export/users/';
        $filename = 'users.csv';
        $absolutePath = $path . $filename;

        if (!file_exists($absolutePath)) {
            $this->session
                ->getFlashBag()
                ->add('danger', $this->cronTimeInterval->getRemainingCronExecutionTime(23))
            ;

            return $this->redirect($request->headers->get('referer'));
        }

        $contentType = 'text/csv';
        $date = date('Y-m-d');

        $response = $this->file($absolutePath, $date . '_' . $filename);
        $response->headers->set('Content-Type', $contentType . '; charset=utf-8');

        return $response;
    }

    public function exportLegacyUsersAction(Request $request): Response
    {
        if (!$this->get(Manager::class)->isActive(Manager::export_legacy_users)) {
            throw new AccessDeniedException();
        }
        $this->admin->checkAccess('export');
        $trans = $this->get('translator');
        $path = $this->container->getParameter('kernel.root_dir') . '/../public/export/';
        $filename = CreateCsvFromLegacyUsersCommand::FILENAME;

        if (!file_exists($path . $filename)) {
            // We create a session for flashBag
            $flashBag = $this->get('session')->getFlashBag();
            $flashBag->add(
                'danger',
                $trans->trans('project.download.not_yet_generated', [], 'CapcoAppBundle')
            );

            return $this->redirect($request->headers->get('referer'));
        }
        $absolutePath = $path . $filename;
        $contentType = 'text/csv';
        $date = date('Y-m-d');

        $response = $this->file($absolutePath, $date . '_' . $filename);
        $response->headers->set('Content-Type', $contentType . '; charset=utf-8');

        return $response;
    }
}
