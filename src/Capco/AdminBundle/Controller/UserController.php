<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Command\CreateCsvFromLegacyUsersCommand;
use Capco\AppBundle\Command\Service\CronTimeInterval;
use Capco\AppBundle\Enum\LogActionDescription;
use Capco\AppBundle\Enum\LogActionType;
use Capco\AppBundle\Logger\ActionLogger;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Repository\UserRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sonata\AdminBundle\Admin\BreadcrumbsBuilderInterface;
use Sonata\AdminBundle\Admin\Pool;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * @Security("is_granted('ROLE_ADMIN')")
 */
class UserController extends CRUDController
{
    private const USER_THRESHOLD = 15000;
    private const CRON_TRIGGER_MINUTE_EARLY = 23;
    private const CRON_TRIGGER_MINUTE_LATE = 53;

    public function __construct(
        BreadcrumbsBuilderInterface $breadcrumbsBuilder,
        Pool $pool,
        private readonly CronTimeInterval $cronTimeInterval,
        private readonly SessionInterface $session,
        private readonly ActionLogger $actionLogger,
        private readonly KernelInterface $kernel,
        private readonly UserRepository $userRepository
    ) {
        parent::__construct($breadcrumbsBuilder, $pool);
    }

    public function listAction(Request $request): Response
    {
        $this->actionLogger->log(
            user: $this->getUser(),
            actionType: LogActionType::SHOW,
            description: sprintf('la page %s', LogActionDescription::USERS_LIST)
        );

        return parent::listAction($request);
    }

    public function editAction($id = null): Response
    {
        $object = $this->get(UserRepository::class)->find($id);

        if (!$object) {
            throw $this->createNotFoundException('The user corresponding to this id doesn\'t exist.');
        }

        return $this->renderWithExtraParams(
            '@CapcoAdmin/User/edit.html.twig',
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
        $this->actionLogger->logExport($this->getUser(), 'des utilisateurs');

        $this->admin->checkAccess('export');

        $path = $this->container->getParameter('kernel.project_dir') . '/public/export/users/';
        $filename = 'users.csv';
        $absolutePath = $path . $filename;

        $usersCount = $this->userRepository->count([]);

        if (($usersCount > self::USER_THRESHOLD) && !file_exists($absolutePath)) {
            $cronExecutionTime = ((int) (new \DateTime())->format('i') > self::CRON_TRIGGER_MINUTE_EARLY)
                ? self::CRON_TRIGGER_MINUTE_LATE
                : self::CRON_TRIGGER_MINUTE_EARLY;

            $this->session
                ->getFlashBag()
                ->add('danger', $this->cronTimeInterval->getRemainingCronExecutionTime($cronExecutionTime))
            ;

            return $this->redirect($request->headers->get('referer'));
        }

        if ($usersCount < self::USER_THRESHOLD) {
            $application = new Application($this->kernel);
            $application->setAutoExit(false);

            $input = new ArrayInput(['command' => 'capco:export:users']);
            $application->run($input);
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
        $path = $this->container->getParameter('kernel.project_dir') . '/public/export/';
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
