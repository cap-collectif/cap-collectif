<?php

namespace Capco\AppBundle\Controller\Site;

use Box\Spout\Common\Creator\HelperFactory;
use Box\Spout\Common\Helper\GlobalFunctionsHelper;
use Box\Spout\Writer\Common\Creator;
use Box\Spout\Writer\Common\Entity\Options;
use Box\Spout\Writer\CSV\Manager\OptionsManager as CSVOptionsManager;
use Box\Spout\Writer\CSV\Writer as CSVWriter;
use Capco\AppBundle\Command\CreateCsvFromEventParticipantsCommand;
use Capco\AppBundle\Command\CreateCsvFromProjectMediatorsProposalsVotesCommand;
use Capco\AppBundle\Command\CreateCsvFromProjectsContributorsCommand;
use Capco\AppBundle\Command\Service\FilePathResolver\AppLogFilePathResolver;
use Capco\AppBundle\Command\Service\FilePathResolver\ContributionsFilePathResolver;
use Capco\AppBundle\Command\Service\FilePathResolver\ParticipantsFilePathResolver;
use Capco\AppBundle\Command\Service\FilePathResolver\VotesFilePathResolver;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Helper\GraphqlQueryAndCsvHeaderHelper;
use Capco\AppBundle\Logger\ActionLogger;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Security\EventVoter;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\AppBundle\Security\QuestionnaireVoter;
use Capco\AppBundle\Service\ExportOnDemandAvailability;
use Capco\AppBundle\Service\ExportOnDemandManager;
use Capco\AppBundle\Service\ExportOnDemandRequest;
use Capco\AppBundle\Utils\Text;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Overblog\GraphQLBundle\Request\Executor;
use Psr\Log\LoggerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\NullOutput;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\File\Exception\FileNotFoundException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\Flash\FlashBagInterface;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\PropertyAccess\Exception\AccessException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Contracts\Translation\TranslatorInterface;

class ExportController extends Controller
{
    private const EXPORT_LOG_DESCRIPTION_CONTRIBUTIONS = 'contributions';
    private const EXPORT_LOG_DESCRIPTION_PARTICIPANTS = 'participants';
    private const EXPORT_LOG_DESCRIPTION_GROUPED = 'regroupées';
    private const EXPORT_LOG_DESCRIPTION_VOTES = 'de vote';

    public function __construct(
        private readonly GraphQlAclListener $aclListener,
        private readonly ConnectionTraversor $connectionTraversor,
        private readonly Executor $executor,
        private readonly LoggerInterface $logger,
        private readonly TranslatorInterface $translator,
        private readonly FlashBagInterface $flashBag,
        private readonly AbstractStepRepository $abstractStepRepository,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly KernelInterface $kernel,
        private readonly ContributionsFilePathResolver $contributionsFilePathResolver,
        private readonly ParticipantsFilePathResolver $participantsFilePathResolver,
        private readonly AppLogFilePathResolver $appLogFilePathResolver,
        private readonly VotesFilePathResolver $votesFilePathResolver,
        private readonly ExportOnDemandManager $exportOnDemandManager,
        private readonly string $exportDir,
        private readonly string $locale,
        private readonly ActionLogger $actionLogger,
    ) {
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
            ->toArray()
        ;

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
                fn ($pageInfo) => $this->getEventContributorsGraphQLQuery(
                    $event->getId(),
                    $pageInfo['endCursor']
                )
            );
            $writer->close();
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', "attachment; filename={$fileName}");

        return $response;
    }

    /**
     * @Route("/export-my-event-participants/{eventId}", name="app_export_my_event_participants", options={"i18n" = false})
     * @Entity("event", options={"mapping": {"eventId": "id"}})
     * @Security("is_granted('ROLE_USER')")
     */
    public function downloadMyEventParticipantsAction(Request $request, Event $event): Response
    {
        if (!$event->viewerDidAuthor($this->getUser()) && !$this->getUser()->isAdmin()) {
            throw new AccessDeniedException();
        }

        $fileName = CreateCsvFromEventParticipantsCommand::getFilename($event->getSlug());
        $filePath = $this->exportDir . $fileName;
        $pendingResponse = $this->handleOnDemandExport(
            request: $request,
            commandName: 'capco:export:events:participants',
            commandOptions: ['eventId' => $event->getId()],
            filePath: $filePath,
            fileName: $fileName
        );
        if ($pendingResponse instanceof Response) {
            return $pendingResponse;
        }

        $response = $this->file($filePath, $fileName);
        $response->headers->set('Content-Type', 'text/csv' . '; charset=utf-8');

        return $response;
    }

    /**
     * @Route("/export-project-contributors/{projectId}", name="app_export_project_contributors", options={"i18n" = false})
     * @Entity("project", options={"mapping": {"projectId": "id"}})
     * @Security("is_granted('ROLE_ADMIN')")
     */
    public function downloadProjectContributorsAction(Request $request, Project $project)
    {
        $fileName = CreateCsvFromProjectsContributorsCommand::getFilename($project->getSlug());

        $filePath = $this->exportDir . $fileName;
        $pendingResponse = $this->handleOnDemandExport(
            request: $request,
            commandName: 'capco:export:projects-contributors',
            commandOptions: ['projectId' => $project->getId()],
            filePath: $filePath,
            fileName: $fileName
        );
        if ($pendingResponse instanceof Response) {
            return $pendingResponse;
        }

        $response = $this->file($filePath, $fileName);
        $response->headers->set('Content-Type', 'text/csv' . '; charset=utf-8');

        $this->actionLogger->logExport($this->getUser(), sprintf('participants du projet %s', $project->getTitle()));

        return $response;
    }

    /**
     * @Route("/export-step-contributors/{stepId}", name="app_export_step_contributors", options={"i18n" = false})
     * @Security("is_granted('ROLE_USER')")
     */
    public function downloadStepContributorsAction(Request $request, mixed $stepId): Response
    {
        $id = GlobalId::fromGlobalId($stepId);
        if ($id && isset($id['id'])) {
            $stepId = $id['id'];
        }

        /** @var null|AbstractStep $step */
        $step = $this->abstractStepRepository->find($stepId);
        if (!$step) {
            $this->logger->error('An error occured while downloading the csv file', [
                'stepId' => $stepId,
            ]);

            throw new BadRequestHttpException('You must provide a valid step id.');
        }

        $organization = $this->getUser()->getOrganization();
        $projectOwner = $step->getProject()->getOwner();
        if ($organization && ($projectOwner !== $organization)) {
            throw new AccessException();
        }

        $isSimplified = 'true' === $request->query->get('simplified');
        $variant = $isSimplified ? ExportVariantsEnum::SIMPLIFIED : ExportVariantsEnum::FULL;

        $fileName = $this->participantsFilePathResolver->getFileName($step, $variant);
        $filePath = sprintf(
            '%s%s/%s',
            $this->exportDir,
            $step->getType(),
            $fileName
        );

        if ($this->isExportEmailDownload($request)) {
            if (!file_exists($filePath)) {
                return new JsonResponse(['errorTranslationKey' => 'project.download.not_yet_generated'], 404);
            }

            $response = $this->file($filePath);
            $response->headers->set('Content-Type', 'text/csv' . '; charset=utf-8');
            $this->logStepParticipantsExport($step);

            return $response;
        }

        $exportCommand = $this->getStepContributorsExportCommand($step);
        if (null === $exportCommand) {
            return new JsonResponse(
                ['errorTranslationKey' => 'project.download.not_yet_generated'],
                404
            );
        }

        [
            'commandName' => $commandName,
            'commandOptions' => $commandOptions,
        ] = $exportCommand;

        $pendingResponse = $this->handleOnDemandExport(
            request: $request,
            commandName: $commandName,
            commandOptions: $commandOptions,
            filePath: $filePath,
            fileName: $fileName
        );

        if ($pendingResponse instanceof Response) {
            return $pendingResponse;
        }

        $this->logStepParticipantsExport($step);

        $response = $this->file($filePath, $fileName);
        $response->headers->set('Content-Type', 'text/csv' . '; charset=utf-8');

        return $response;
    }

    /**
     * @Route("/download-app-logs", name="app_export_app_logs", options={"i18n" = false})
     * @Security("is_granted('ROLE_ADMIN')")
     */
    public function downloadAppLog(Request $request): Response
    {
        $fileName = $this->appLogFilePathResolver->getFileName();
        $filePath = $this->appLogFilePathResolver->getExportPath();

        $pendingResponse = $this->handleOnDemandExport(
            request: $request,
            commandName: 'capco:export:app-logs',
            commandOptions: [],
            filePath: $filePath,
            fileName: $fileName
        );
        if ($pendingResponse instanceof Response) {
            return $pendingResponse;
        }

        $fileName = (new \DateTime())->format('Y-m-d') . '_' . $fileName;

        $this->actionLogger->logExport($this->getUser(), 'logs applicatifs');

        $response = $this->file($filePath, $fileName);
        $response->headers->set('Content-Type', 'text/csv' . '; charset=utf-8');

        return $response;
    }

    /**
     * @Route("/export-step-proposal-form-csv-model/{stepId}", name="app_export_step_proposal_form_csv_model", options={"i18n" = false})
     */
    public function downloadProposalFormCsvModelAction(Request $request, string $stepId): Response
    {
        /** @var CollectStep|SelectionStep $step */
        $step = $this->globalIdResolver->resolve($stepId, $this->getUser());
        $output = new NullOutput();

        $proposalFormId = $step->getProposalFormId();
        $proposalForm = $step->getProposalForm();
        /** * @var User $viewer  */
        $viewer = $this->getUser();

        if (!$viewer) {
            throw new AccessDeniedException();
        }

        $viewerIsNotProjectOwner = $viewer->isOnlyProjectAdmin() && $proposalForm->getProject()->getOwner() !== $viewer;
        $isMemberOrga = $viewer->isOrganizationMember();

        if (!$proposalForm || ($viewerIsNotProjectOwner && !$isMemberOrga)) {
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

    /**
     * @Route("/import-event-csv-template", name="app_export_event_csv_template", options={"i18n" = false})
     */
    public function importEventCSVTemplate(Request $request, TranslatorInterface $translator): Response
    {
        $headerKeys = [
            'global.title',
            'global.description',
            'project_download.label.author_email',
            'event.import.start',
            'end',
            'global.registration',
            'project_download.label.address',
            'admin.fields.event.zipcode',
            'admin.fields.event.city',
            'admin.fields.event.country',
            'event.import.theme',
            'global.project.label',
            'global.zones',
            'global.publication',
            'admin.fields.proposal.comments',
            'event.import.metadescription',
            'event.import.customcode',
            'project_download.label.link',
        ];

        $exampleRow = [
            "Titre de l'event",
            "Contenu de l'event",
            'admin@cap-collectif.com',
            '2010-05-20 00:00:00',
            '2010-07-24 00:00:00',
            'oui',
            '2 rue neuve Saint-Pierre',
            '75004',
            'Paris',
            'France',
            'titre du theme1/titre du theme2',
            'titre du projet1/titre du projet2',
            'titre de la zone1/titre de la zone2',
            'oui',
            'oui',
            '',
            '',
            '',
        ];

        $headers = array_map(fn ($key) => $translator->trans($key), $headerKeys);

        $data = [
            $headers,
            $exampleRow,
        ];

        $response = new Response();

        // set encoding
        $csvContent = "\xEF\xBB\xBF";

        $file = fopen('php://temp', 'r+');

        if (false === $file) {
            throw new \Exception('Could not open file.');
        }

        foreach ($data as $row) {
            fputcsv($file, $row, ';');
        }
        rewind($file);
        $csvContent .= stream_get_contents($file);
        fclose($file);

        $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
        $response->headers->set('Content-Disposition', 'attachment; filename="import_events_template.csv"');
        $response->setContent($csvContent);

        return $response;
    }

    /**
     * @Route("/export-project-mediators-proposals-votes/{projectId}", name="app_export_project_mediators_proposals_votes", options={"i18n" = false})
     * @Security("is_granted('ROLE_ADMIN')")
     */
    public function downloadProjectMediatorsProposalsVotesAction(string $projectId): BinaryFileResponse
    {
        $project = $this->globalIdResolver->resolve($projectId, $this->getUser());
        $output = new NullOutput();
        $this->runCommands(
            [
                'capco:export:projects-mediators-proposals-votes' => ['projectId' => $project->getId()],
            ],
            $output
        );

        $fileName = CreateCsvFromProjectMediatorsProposalsVotesCommand::getFilename($project->getSlug());

        $response = $this->file($this->exportDir . $fileName, $fileName);
        $response->headers->set('Content-Type', 'text/csv' . '; charset=utf-8');

        return $response;
    }

    /**
     * @Route("/questionnaires/{questionnaireId}/download", name="app_questionnaire_download", options={"i18n" = false})
     * @Entity("questionnaire", class="CapcoAppBundle:Questionnaire", options={"mapping": {"questionnaireId": "id"}})
     */
    public function downloadQuestionnaireAction(Request $request, Questionnaire $questionnaire): Response
    {
        $this->denyAccessUnlessGranted(QuestionnaireVoter::EDIT, $questionnaire);

        $questionnaireStep = $questionnaire->getStep();
        if (!$questionnaireStep instanceof QuestionnaireStep) {
            throw new BadRequestHttpException('You must provide a valid questionnaire id.');
        }

        $filePath = 'true' === $request->query->get('simplified')
            ? $this->contributionsFilePathResolver->getSimplifiedExportPath($questionnaireStep)
            : $this->contributionsFilePathResolver->getFullExportPath($questionnaireStep);

        try {
            $response = $this->file($filePath);
            $response->headers->set('Content-Type', 'application/vnd.ms-excel' . '; charset=utf-8');

            return $response;
        } catch (FileNotFoundException) {
            $pendingResponse = $this->handleOnDemandExport(
                request: $request,
                commandName: 'capco:export:questionnaire:contributions',
                commandOptions: ['stepId' => $questionnaireStep->getId()],
                filePath: $filePath
            );

            return $pendingResponse ?? $this->redirect($request->headers->get('referer'));
        }
    }

    /**
     * @Route("/projects/{projectSlug}/step/{stepSlug}/download", name="app_project_download", options={"i18n" = false})
     * @Entity("project", class="CapcoAppBundle:Project", options={"mapping": {"projectSlug": "slug"}})
     * @Entity("step", class="CapcoAppBundle:Steps\AbstractStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     */
    public function downloadAction(Request $request, Project $project, AbstractStep $step): Response
    {
        $this->denyAccessUnlessGranted(ProjectVoter::EDIT, $project);
        $filePath = match (true) {
            'true' === $request->query->get('simplified') && 'true' === $request->query->get('votes') => $this->votesFilePathResolver->getSimplifiedExportPath($step),
            'true' === $request->query->get('simplified') => $this->contributionsFilePathResolver->getSimplifiedExportPath($step),
            'true' === $request->query->get('grouped') => $this->contributionsFilePathResolver->getGroupedExportPath($step),
            default => $this->contributionsFilePathResolver->getFullExportPath($step)
        };

        if ($this->isExportEmailDownload($request)) {
            if (!file_exists($filePath)) {
                return new JsonResponse(['errorTranslationKey' => 'project.download.not_yet_generated'], 404);
            }

            $response = $this->file($filePath);
            $response->headers->set('Content-Type', 'text/csv' . '; charset=utf-8');
            $this->logStepContributionsExport($request, $step);

            return $response;
        }

        [
            'commandName' => $commandName,
            'commandOptions' => $commandOptions,
        ] = $this->getProjectStepExportCommand($request, $step);

        $pendingResponse = $this->handleOnDemandExport(
            request: $request,
            commandName: $commandName,
            commandOptions: $commandOptions,
            filePath: $filePath
        );

        if ($pendingResponse instanceof Response) {
            return $pendingResponse;
        }

        $response = $this->file($filePath);
        $response->headers->set('Content-Type', 'text/csv' . '; charset=utf-8');
        $this->logStepContributionsExport($request, $step);

        return $response;
    }

    /**
     * @return null|array{commandName: string, commandOptions: array<string, mixed>}
     */
    private function getStepContributorsExportCommand(AbstractStep $step): ?array
    {
        return match ($step->getType()) {
            CollectStep::TYPE => [
                'commandName' => 'capco:export:collect:participants',
                'commandOptions' => ['stepId' => $step->getId()],
            ],
            SelectionStep::TYPE => [
                'commandName' => 'capco:export:selection:participants',
                'commandOptions' => ['stepId' => $step->getId()],
            ],
            ConsultationStep::TYPE => [
                'commandName' => 'capco:export:consultation:participants',
                'commandOptions' => ['stepId' => $step->getId()],
            ],
            QuestionnaireStep::TYPE => [
                'commandName' => 'capco:export:questionnaire:participants',
                'commandOptions' => ['stepId' => $step->getId()],
            ],
            DebateStep::TYPE => $this->getDebateParticipantsExportCommand($step),
            default => null,
        };
    }

    /**
     * @return array{commandName: string, commandOptions: array<string, mixed>}
     */
    private function getDebateParticipantsExportCommand(AbstractStep $step): array
    {
        if (!$step instanceof DebateStep) {
            throw new \LogicException(sprintf('Unexpected step class "%s" for debate participants export.', get_debug_type($step)));
        }

        $debate = $step->getDebate();
        if (null === $debate) {
            throw new BadRequestHttpException(sprintf('Debate step "%s" has no debate.', $step->getId()));
        }

        return [
            'commandName' => 'capco:export:debate:participants',
            'commandOptions' => ['debateId' => $debate->getId()],
        ];
    }

    /**
     * @return array{commandName: string, commandOptions: array<string, mixed>}
     */
    private function getProjectStepExportCommand(Request $request, AbstractStep $step): array
    {
        $isVotesExport = 'true' === $request->query->get('votes') && 'true' === $request->query->get('simplified');
        $isGroupedExport = 'true' === $request->query->get('grouped');

        return match ($step->getType()) {
            CollectStep::TYPE, SelectionStep::TYPE => [
                'commandName' => $isVotesExport ? 'capco:export:collect-selection:votes' : 'capco:export:collect-selection:contributions',
                'commandOptions' => ['stepId' => $step->getId()],
            ],
            ConsultationStep::TYPE => [
                'commandName' => $isGroupedExport ? 'capco:export:consultation:grouped' : 'capco:export:consultation:contributions',
                'commandOptions' => ['stepId' => $step->getId()],
            ],
            QuestionnaireStep::TYPE => [
                'commandName' => 'capco:export:questionnaire:contributions',
                'commandOptions' => ['stepId' => $step->getId()],
            ],
            DebateStep::TYPE => $this->getDebateExportCommand($step, $isVotesExport, $isGroupedExport),
            default => throw new BadRequestHttpException(sprintf('Step type "%s" is not exportable.', $step->getType())),
        };
    }

    /**
     * @return array{commandName: string, commandOptions: array<string, mixed>}
     */
    private function getDebateExportCommand(AbstractStep $step, bool $isVotesExport, bool $isGroupedExport): array
    {
        if (!$step instanceof DebateStep) {
            throw new \LogicException(sprintf('Unexpected step class "%s" for debate export.', get_debug_type($step)));
        }

        if ($isVotesExport) {
            return [
                'commandName' => 'capco:export:debate:votes',
                'commandOptions' => ['debateStepId' => $step->getId()],
            ];
        }

        if ($isGroupedExport) {
            return [
                'commandName' => 'capco:export:debate-grouped',
                'commandOptions' => ['stepId' => $step->getId()],
            ];
        }

        $debate = $step->getDebate();
        if (null === $debate) {
            throw new BadRequestHttpException(sprintf('Debate step "%s" has no debate.', $step->getId()));
        }

        return [
            'commandName' => 'capco:export:debate:contributions',
            'commandOptions' => ['debateId' => $debate->getId()],
        ];
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
        $CONTRIBUTOR_FRAGMENT = GraphqlQueryAndCsvHeaderHelper::CONTRIBUTOR_FRAGMENT;

        return <<<EOF
                    query {
                      node(id: "{$eventId}") {
                        ... on Event {
                          participants(first: 50 {$userCursor}) {
                            edges {
                              cursor
                              registeredAt
                              registeredAnonymously
                              node {
                                ... on User {
                                    {$CONTRIBUTOR_FRAGMENT}
                                    {$USER_FRAGMENT}
                                    consentExternalCommunication
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

    /**
     * @param array<string, mixed> $commandOptions
     */
    private function handleOnDemandExport(
        Request $request,
        string $commandName,
        array $commandOptions,
        string $filePath,
        ?string $fileName = null,
    ): ?Response {
        $user = $this->getUser();

        if (!$user instanceof User) {
            throw new AccessDeniedException();
        }

        $exportRequest = new ExportOnDemandRequest(
            commandName: $commandName,
            commandOptions: $commandOptions,
            filePath: $filePath,
            downloadUrl: $request->getUri(),
            user: $user,
            fileName: $fileName
        );

        $availability = $this->exportOnDemandManager->ensureExportAvailable($exportRequest);

        if (ExportOnDemandAvailability::AVAILABLE === $availability) {
            return null;
        }

        if (ExportOnDemandAvailability::EMPTY === $availability) {
            return new JsonResponse(['errorTranslationKey' => 'export.empty'], 202);
        }

        if (ExportOnDemandAvailability::FAILED === $availability) {
            return new JsonResponse(['errorTranslationKey' => 'global.saving.error'], 500);
        }

        return new JsonResponse(['errorTranslationKey' => 'export.requested'], 202);
    }

    private function isExportEmailDownload(Request $request): bool
    {
        return \in_array($request->query->get('fromEmail'), ['1', 'true'], true);
    }

    private function logStepParticipantsExport(AbstractStep $step): void
    {
        $this->actionLogger->logExport(
            $this->getUser(),
            sprintf("%s de l'étape %s", self::EXPORT_LOG_DESCRIPTION_PARTICIPANTS, $step->getTitle())
        );
    }

    private function logStepContributionsExport(Request $request, AbstractStep $step): void
    {
        $this->actionLogger->logExport(
            $this->getUser(),
            sprintf("%s de l'étape %s", $this->getStepContributionsExportLogDescription($request), $step->getTitle())
        );
    }

    private function getStepContributionsExportLogDescription(Request $request): string
    {
        if ('true' === $request->query->get('grouped')) {
            return self::EXPORT_LOG_DESCRIPTION_GROUPED;
        }

        if ('true' === $request->query->get('votes') && 'true' === $request->query->get('simplified')) {
            return self::EXPORT_LOG_DESCRIPTION_VOTES;
        }

        return self::EXPORT_LOG_DESCRIPTION_CONTRIBUTIONS;
    }
}
