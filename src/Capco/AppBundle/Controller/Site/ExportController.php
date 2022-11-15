<?php

namespace Capco\AppBundle\Controller\Site;

use Box\Spout\Common\Creator\HelperFactory;
use Box\Spout\Common\Helper\GlobalFunctionsHelper;
use Box\Spout\Writer\Common\Creator;
use Box\Spout\Writer\Common\Entity\Options;
use Box\Spout\Writer\CSV\Manager\OptionsManager as CSVOptionsManager;
use Box\Spout\Writer\CSV\Writer as CSVWriter;
use Capco\AppBundle\Command\CreateCsvFromEventParticipantsCommand;
use Capco\AppBundle\Command\CreateCsvFromProjectsContributorsCommand;
use Capco\AppBundle\Command\CreateStepContributorsCommand;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Helper\GraphqlQueryAndCsvHeaderHelper;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Security\EventVoter;
use Capco\AppBundle\Utils\Text;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Overblog\GraphQLBundle\Request\Executor;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\NullOutput;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\Flash\FlashBagInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

class ExportController extends Controller
{
    private FlashBagInterface $flashBag;
    private TranslatorInterface $translator;
    private string $exportDir;
    private GraphQlAclListener $aclListener;
    private ConnectionTraversor $connectionTraversor;
    private Executor $executor;
    private LoggerInterface $logger;
    private AbstractStepRepository $abstractStepRepository;
    private GlobalIdResolver $globalIdResolver;
    private KernelInterface $kernel;
    private string $locale;
    private AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(
        GraphQlAclListener $aclListener,
        ConnectionTraversor $connectionTraversor,
        Executor $executor,
        LoggerInterface $logger,
        TranslatorInterface $translator,
        FlashBagInterface $flashBag,
        AbstractStepRepository $abstractStepRepository,
        GlobalIdResolver $globalIdResolver,
        KernelInterface $kernel,
        AuthorizationCheckerInterface $authorizationChecker,
        string $exportDir,
        string $locale
    ) {
        $this->flashBag = $flashBag;
        $this->translator = $translator;
        $this->exportDir = $exportDir;
        $this->aclListener = $aclListener;
        $this->connectionTraversor = $connectionTraversor;
        $this->executor = $executor;
        $this->abstractStepRepository = $abstractStepRepository;
        $this->logger = $logger;
        $this->globalIdResolver = $globalIdResolver;
        $this->kernel = $kernel;
        $this->locale = $locale;
        $this->authorizationChecker = $authorizationChecker;
    }

    /**
     * @Route("/export-event-participants/{eventId}", name="app_export_event_participants", options={"i18n" = false})
     */
    public function downloadEventParticipantsAction(
        string $eventId,
        EventRepository $eventRepository,
        EntityManagerInterface $em
    ): StreamedResponse {
        $user = $this->getUser();

        if ($user->isProjectAdmin()) {
            if ($em->getFilters()->isEnabled('softdeleted')) {
                $em->getFilters()->disable('softdeleted');
            }
        }

        $event = $eventRepository->find($eventId);
        $this->denyAccessUnlessGranted(EventVoter::EXPORT, $event);

        $this->aclListener->disableAcl();

        $data = $this->executor
            ->execute('internal', [
                'query' => $this->getEventContributorsGraphQLQuery($event->getId()),
                'variables' => [],
            ])
            ->toArray();

        if (!isset($data['data'])) {
            $this->logger->error('GraphQL Query Error: ' . $data['errors']);
            $this->logger->info('GraphQL query: ' . json_encode($data));
        }
        $fileName =
            (new \DateTime())->format('Y-m-d') .
            '-registeredAttendees-' .
            $event->getSlug() .
            '.csv';

        $optionsManager = new CSVOptionsManager();
        $optionsManager->setOption(Options::FIELD_DELIMITER, ';');
        $globalFunctionsHelper = new GlobalFunctionsHelper();

        $helperFactory = new HelperFactory();

        $writer = new CSVWriter($optionsManager, $globalFunctionsHelper, $helperFactory);

        $response = new StreamedResponse(function () use ($writer, $data, $event) {
            $writer->openToFile('php://output');
            $writer->addRow(
                Creator\WriterEntityFactory::createRowFromArray(
                    GraphqlQueryAndCsvHeaderHelper::USER_HEADERS_EVENTS
                )
            );
            $this->connectionTraversor->traverse(
                $data,
                'participants',
                function ($edge) use ($writer) {
                    $contributor = $edge['node'];
                    if (isset($contributor['id'])) {
                        $writer->addRow(
                            Creator\WriterEntityFactory::createRowFromArray([
                                $contributor['id'],
                                $contributor['email'],
                                $contributor['username'],
                                $contributor['userType'] ? $contributor['userType']['name'] : null,
                                $edge['registeredAt'],
                                $edge['registeredAnonymously'] ? 'yes' : 'no',
                                $contributor['createdAt'],
                                $contributor['updatedAt'],
                                $contributor['lastLogin'],
                                $contributor['rolesText'],
                                $contributor['consentExternalCommunication'],
                                $contributor['enabled'],
                                $contributor['isEmailConfirmed'],
                                $contributor['locked'],
                                $contributor['phoneConfirmed'],
                                $contributor['gender'],
                                $contributor['dateOfBirth'],
                                $contributor['websiteUrl'],
                                $contributor['biography'],
                                $contributor['address'],
                                $contributor['zipCode'],
                                $contributor['city'],
                                $contributor['phone'],
                                $contributor['url'],
                            ])
                        );
                    } else {
                        $writer->addRow(
                            Creator\WriterEntityFactory::createRowFromArray([
                                null,
                                $contributor['notRegisteredEmail'],
                                $contributor['username'],
                                null,
                                $edge['registeredAt'],
                                $edge['registeredAnonymously'] ? 'yes' : 'no',
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                            ])
                        );
                    }
                },
                function ($pageInfo) use ($event) {
                    return $this->getEventContributorsGraphQLQuery(
                        $event->getId(),
                        $pageInfo['endCursor']
                    );
                }
            );
            $writer->close();
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', "attachment; filename=${fileName}");

        return $response;
    }

    /**
     * @Route("/export-my-event-participants/{eventId}", name="app_export_my_event_participants", options={"i18n" = false})
     * @Entity("event", options={"mapping": {"eventId": "id"}})
     * @Security("has_role('ROLE_USER')")
     */
    public function downloadMyEventParticipantsAction(Request $request, Event $event): Response
    {
        if (!$event->viewerDidAuthor($this->getUser()) && !$this->getUser()->isAdmin()) {
            throw new AccessDeniedException();
        }

        $fileName = CreateCsvFromEventParticipantsCommand::getFilename($event->getSlug());
        if (file_exists($this->exportDir . $fileName)) {
            $response = $this->file($this->exportDir . $fileName, $fileName);
            $response->headers->set('Content-Type', 'text/csv' . '; charset=utf-8');

            return $response;
        }

        $this->flashBag->add(
            'danger',
            $this->translator->trans(
                'project_contributors.download.not_yet_generated',
                [],
                'CapcoAppBundle'
            )
        );

        return $this->redirect($request->headers->get('referer'));
    }

    /**
     * @Route("/export-project-contributors/{projectId}", name="app_export_project_contributors", options={"i18n" = false})
     * @Entity("project", options={"mapping": {"projectId": "id"}})
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function downloadProjectContributorsAction(Request $request, Project $project)
    {
        $fileName = CreateCsvFromProjectsContributorsCommand::getFilename($project->getSlug());

        if (!file_exists($this->exportDir . $fileName)) {
            return new JsonResponse(
                ['errorTranslationKey' => 'project_contributors.download.not_yet_generated'],
                404
            );
        }
        $response = $this->file($this->exportDir . $fileName, $fileName);
        $response->headers->set('Content-Type', 'text/csv' . '; charset=utf-8');

        return $response;
    }

    /**
     * @Route("/export-step-contributors/{stepId}", name="app_export_step_contributors", options={"i18n" = false})
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function downloadStepContributorsAction(Request $request, $stepId): Response
    {
        $id = GlobalId::fromGlobalId($stepId);
        if ($id && isset($id['id'])) {
            $stepId = $id['id'];
        }
        $step = $this->abstractStepRepository->find($stepId);
        if (!$step) {
            $this->logger->error('An error occured while downloading the csv file', [
                'stepId' => $stepId,
            ]);

            throw new BadRequestHttpException('You must provide a valid step id.');
        }

        $fileName = CreateStepContributorsCommand::getFilename($step);
        $absolutePath = $this->exportDir . $fileName;

        $filesystem = new Filesystem();
        if (!$filesystem->exists($absolutePath)) {
            $this->logger->error('File not found', [
                'filename' => $absolutePath,
            ]);

            return new JsonResponse(['errorTranslationKey' => 'file.not-found'], 404);
        }
        $fileName = (new \DateTime())->format('Y-m-d') . '_' . $fileName;

        $response = $this->file($absolutePath, $fileName);
        $response->headers->set('Content-Type', 'text/csv' . '; charset=utf-8');

        return $response;
    }

    /**
     * @Route("/export-step-proposal-form-csv-model/{stepId}", name="app_export_step_proposal_form_csv_model", options={"i18n" = false})
     * @Security("has_role('ROLE_PROJECT_ADMIN')")
     */
    public function downloadProposalFormCsvModelAction(Request $request, string $stepId): Response
    {
        /** @var CollectStep|SelectionStep $step */
        $step = $this->globalIdResolver->resolve($stepId, $this->getUser());
        $output = new NullOutput();

        $proposalFormId = $step->getProposalFormId();
        $proposalForm = $step->getProposalForm();
        $viewer = $this->getUser();
        $viewerIsNotProjectOwner =
            $viewer->isOnlyProjectAdmin() && $proposalForm->getProject()->getOwner() !== $viewer;
        if (!$proposalForm || $viewerIsNotProjectOwner) {
            throw new AccessDeniedException();
        }

        $this->runCommands(
            [
                'capco:import-proposals:generate-header-csv' => [
                    'proposal-form' => $proposalFormId,
                    '--isCliModel' => false,
                ],
            ],
            $output
        );

        $filename =
            Text::sanitizeFileName($step->getProject()->getTitle()) .
            '-' .
            Text::sanitizeFileName($step->getTitle()) .
            '_vierge.csv';

        setlocale(\LC_CTYPE, str_replace('-', '_', $this->locale));
        $filename = iconv('UTF-8', 'ASCII//TRANSLIT', $filename);

        $filePath = '/tmp/' . $filename;
        if (!file_exists($filePath)) {
            $this->flashBag->add(
                'danger',
                $this->translator->trans('proposal-csv-model-download-error', [], 'CapcoAppBundle')
            );

            return $this->redirect($request->headers->get('referer'));
        }
        $response = $this->file($filePath, $filename);
        $response->headers->set('Content-Type', 'text/csv' . '; charset=utf-8');

        return $response;
    }

    private function getEventContributorsGraphQLQuery(
        string $eventId,
        ?string $userCursor = null
    ): string {
        if ($userCursor) {
            $userCursor = sprintf(', after: "%s"', $userCursor);
        }

        $eventId = GlobalId::toGlobalId('Event', $eventId);
        $USER_FRAGMENT = GraphqlQueryAndCsvHeaderHelper::USER_FRAGMENT;

        return <<<EOF
        query {
          node(id: "${eventId}") {
            ... on Event {
              participants(first: 50 ${userCursor}) {
                edges {
                  cursor
                  registeredAt
                  registeredAnonymously
                  node {
                    ... on User {
                        ${USER_FRAGMENT}
                    }
                    ... on NotRegistered {
                      username
                      notRegisteredEmail: email
                    }
                  }
                }
                pageInfo {
                  startCursor
                  endCursor
                  hasNextPage
                }
              }
            }
          }
        }
EOF;
    }

    private function runCommands(array $commands, $output)
    {
        $application = new Application($this->kernel);

        foreach ($commands as $key => $value) {
            $input = new ArrayInput($value);
            $input->setInteractive(false);
            $application->find($key)->run($input, $output);
        }
    }
}
