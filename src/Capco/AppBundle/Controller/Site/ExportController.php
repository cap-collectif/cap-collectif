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
use Capco\AppBundle\Command\CreateStepContributorsCommand;
use Capco\AppBundle\Command\ExportDebateCommand;
use Capco\AppBundle\Command\ExportDebateContributionsCommand;
use Capco\AppBundle\Command\Service\CronTimeInterval;
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
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Helper\GraphqlQueryAndCsvHeaderHelper;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\DebateRepository;
use Capco\AppBundle\Repository\DebateStepRepository;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Security\EventVoter;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\AppBundle\Security\QuestionnaireVoter;
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
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\File\Exception\FileNotFoundException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\Flash\FlashBagInterface;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\PropertyAccess\Exception\AccessException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Contracts\Translation\TranslatorInterface;

class ExportController extends Controller
{
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
        private readonly VotesFilePathResolver $votesFilePathResolver,
        private readonly SessionInterface $session,
        private readonly CronTimeInterval $cronTimeInterval,
        private readonly string $exportDir,
        private readonly string $locale,
        private readonly string $projectDir
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
     * @Security("is_granted('ROLE_ADMIN')")
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
     * @Route("/export-step-contributors/{stepId}/download-consultation", name="app_export_step_contributors_download_consultation", options={"i18n" = false})
     * @Security("is_granted('ROLE_USER')")
     */
    public function downloadConsultationParticipantAction(Request $request, string $stepId): Response
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

        $fileName = $this->participantsFilePathResolver->getFileName($step, $isSimplified);
        $filePath = sprintf(
            '%s%s/%s',
            $this->exportDir,
            $step->getType(),
            $fileName
        );

        if (!file_exists($filePath)) {
            $this->session
                ->getFlashBag()
                ->add('danger', $this->cronTimeInterval->getRemainingCronExecutionTime(5))
            ;

            $redirectUrl = $request->headers->get('referer') ?? $this->generateUrl('app_homepage');

            return $this->redirect($redirectUrl);
        }

        $response = $this->file($filePath, $fileName);
        $response->headers->set('Content-Type', 'text/csv' . '; charset=utf-8');

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

        // TODO remove this if after all export participants has been merged
        if ($step instanceof QuestionnaireStep) {
            $isSimplified = 'true' === $request->query->get('simplified');

            $fileName = $this->participantsFilePathResolver->getFileName($step, $isSimplified);
            $filePath = sprintf(
                '%s%s/%s',
                $this->exportDir,
                $step->getType(),
                $fileName
            );
            if (!file_exists($filePath)) {
                $this->session
                    ->getFlashBag()
                    ->add('danger', $this->cronTimeInterval->getRemainingCronExecutionTime(5))
                ;

                $redirectUrl = $request->headers->get('referer') ?? $this->generateUrl('app_homepage');

                return $this->redirect($redirectUrl);
            }

            $response = $this->file($filePath, $fileName);
            $response->headers->set('Content-Type', 'text/csv' . '; charset=utf-8');

            return $response;
        }

        // TODO remove this if after all export participants has been merged
        if ($step instanceof DebateStep) {
            $organization = $this->getUser()?->getOrganization();
            $projectOwner = $step->getProject()?->getOwner();
            if ($organization && ($projectOwner !== $organization)) {
                throw new AccessException();
            }

            $isSimplified = 'true' === $request->query->get('simplified');

            $fileName = $this->participantsFilePathResolver->getFileName($step, $isSimplified);
            $filePath = sprintf(
                '%s%s/%s',
                $this->exportDir,
                'debate',
                $fileName
            );

            if (!file_exists($filePath)) {
                $this->session
                    ->getFlashBag()
                    ->add('danger', $this->cronTimeInterval->getRemainingCronExecutionTime(38))
                ;

                return $this->redirect($request->headers->get('referer') ?? '/admin-next/projects');
            }
            $fileName = (new \DateTime())->format('Y-m-d') . '_' . $fileName;

            $response = $this->file($filePath, $fileName);
            $response->headers->set('Content-Type', 'text/csv' . '; charset=utf-8');

            return $response;
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
     * @Route("/export-step-contributors/{stepId}/download-collect", name="app_export_step_contributors_download_collect", options={"i18n" = false})
     * @Security("is_granted('ROLE_USER')")
     */
    public function downloadCollectParticipantAction(Request $request, string $stepId): Response
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

        $organization = $this->getUser()?->getOrganization();
        $projectOwner = $step->getProject()?->getOwner();
        if ($organization && ($projectOwner !== $organization)) {
            throw new AccessException();
        }

        $isSimplified = 'true' === $request->query->get('simplified');

        $fileName = $this->participantsFilePathResolver->getFileName($step, $isSimplified);
        $filePath = sprintf(
            '%s%s/%s',
            $this->exportDir,
            'collect',
            $fileName
        );

        if (!file_exists($filePath)) {
            $this->session
                ->getFlashBag()
                ->add('danger', $this->cronTimeInterval->getRemainingCronExecutionTime(38))
            ;

            return $this->redirect($request->headers->get('referer') ?? '/admin-next/projects');
        }
        $fileName = (new \DateTime())->format('Y-m-d') . '_' . $fileName;

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
     * @Route("/debate/{debateId}/download/{type}", name="app_debate_download", options={"i18n" = false})
     * @Security("is_granted('ROLE_PROJECT_ADMIN')")
     */
    public function downloadArgumentsAction(
        Request $request,
        string $debateId,
        string $type
    ): Response {
        $debateId = GlobalId::fromGlobalId($debateId)['id'];

        $user = $this->getUser();
        $isProjectAdmin = $user->isOnlyProjectAdmin();

        $fileName = ExportDebateCommand::getFilename($debateId, $type, $isProjectAdmin);
        $filePath = $this->projectDir . '/public/export/' . $fileName;

        if (!file_exists($filePath)) {
            $this->session
                ->getFlashBag()
                ->add('danger', $this->translator->trans('project.download.not_yet_generated'))
            ;

            return $this->redirect($request->headers->get('referer'));
        }
        $date = (new \DateTime())->format('Y-m-d');

        $response = $this->file($filePath, $date . '_' . $fileName);
        $response->headers->set('Content-Type', 'text/csv' . '; charset=utf-8');

        return $response;
    }

    /**
     * @Route("/debate/{debateId}/download-contributions/{type}", name="app_debate_contributions_download", options={"i18n" = false})
     * @Security("is_granted('ROLE_PROJECT_ADMIN')")
     */
    public function downloadDebateContributionAction(
        Request $request,
        string $debateId,
        DebateRepository $debateRepository
    ): Response {
        $debateId = GlobalId::fromGlobalId($debateId)['id'];
        $debate = $debateRepository->find($debateId);

        $isSimplified = 'true' === $request->query->get('simplified');

        $fileName = $this->contributionsFilePathResolver->getFileName($debate->getStep(), $isSimplified);
        $filePath = sprintf(
            '%s%s/%s',
            $this->exportDir,
            ExportDebateContributionsCommand::STEP_FOLDER,
            $fileName
        );

        if (!file_exists($filePath)) {
            $this->session
                ->getFlashBag()
                ->add('danger', $this->cronTimeInterval->getRemainingCronExecutionTime(58))
            ;

            return $this->redirect($request->headers->get('referer'));
        }
        $date = (new \DateTime())->format('Y-m-d');

        $response = $this->file($filePath, $date . '_' . $fileName);
        $response->headers->set('Content-Type', 'text/csv' . '; charset=utf-8');

        return $response;
    }

    /**
     * @Route("/debate/{debateStepId}/download-votes/{type}", name="app_debate_votes_download", options={"i18n" = false})
     * @Security("has_role('ROLE_PROJECT_ADMIN')")
     */
    public function downloadDebateVoteAction(
        Request $request,
        string $debateStepId,
        DebateStepRepository $debateStepRepository
    ): Response {
        $id = GlobalId::fromGlobalId($debateStepId);
        if ($id && isset($id['id'])) {
            $debateStepId = $id['id'];
        }

        $debateStep = $debateStepRepository->find($debateStepId);

        if (!$debateStep) {
            $this->logger->error('An error occured while downloading the csv file', [
                'debateStepId' => $debateStepId,
            ]);

            throw new BadRequestHttpException('You must provide a valid debate Step id.');
        }

        $isSimplified = 'true' === $request->query->get('simplified');

        $fileName = $this->votesFilePathResolver->getFileName($debateStep, $isSimplified);
        $filePath = sprintf(
            '%s%s/%s',
            $this->exportDir,
            ExportDebateContributionsCommand::STEP_FOLDER,
            $fileName
        );

        if (!file_exists($filePath)) {
            $this->session
                ->getFlashBag()
                ->add('danger', $this->cronTimeInterval->getRemainingCronExecutionTime(53))
            ;

            return $this->redirect($request->headers->get('referer'));
        }
        $date = (new \DateTime())->format('Y-m-d');

        $response = $this->file($filePath, $date . '_' . $fileName);
        $response->headers->set('Content-Type', 'text/csv' . '; charset=utf-8');

        return $response;
    }

    /**
     * @Route("/export-step-contributors/{stepId}/download-selection", name="app_export_step_contributors_download_selection", options={"i18n" = false})
     * @Security("has_role('ROLE_USER')")
     */
    public function downloadSelectionParticipantAction(Request $request, string $stepId): Response
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

        $fileName = $this->participantsFilePathResolver->getFileName($step, $isSimplified);
        $filePath = sprintf(
            '%s%s/%s',
            $this->exportDir,
            'selection',
            $fileName
        );

        if (!file_exists($filePath)) {
            $this->session
                ->getFlashBag()
                ->add('danger', $this->cronTimeInterval->getRemainingCronExecutionTime(9))
            ;

            return $this->redirect($request->headers->get('referer') ?? '/admin-next/projects');
        }

        $fileName = (new \DateTime())->format('Y-m-d') . '_' . $fileName;

        $response = $this->file($filePath, $fileName);
        $response->headers->set('Content-Type', 'text/csv' . '; charset=utf-8');

        return $response;
    }

    /**
     * @Route("/projects/{projectSlug}/step/{stepSlug}/download-consultation", name="app_project_download_consultation", options={"i18n" = false})
     * @Entity("project", class="CapcoAppBundle:Project", options={"mapping": {"projectSlug": "slug"}})
     * @Entity("step", class="CapcoAppBundle:Steps\AbstractStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     *
     * @return BinaryFileResponse|RedirectResponse
     */
    public function downloadConsultationContributionAction(Request $request, Project $project, ConsultationStep $step)
    {
        $this->denyAccessUnlessGranted(ProjectVoter::EDIT, $project);

        $isSimplified = 'true' === $request->query->get('simplified');

        $fileName = $this->contributionsFilePathResolver->getFileName($step, $isSimplified);
        $filePath = sprintf(
            '%s%s/%s',
            $this->exportDir,
            $step->getType(),
            $fileName
        );

        if (!file_exists($filePath)) {
            $this->session
                ->getFlashBag()
                ->add('danger', $this->cronTimeInterval->getRemainingCronExecutionTime())
            ;

            return $this->redirect($request->headers->get('referer'));
        }

        $response = $this->file($filePath, $fileName);
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
            // We create a session for flashBag
            $flashBag = $this->get('session')->getFlashBag();

            $flashBag->add(
                'danger',
                $this->translator->trans('project.download.not_yet_generated')
            );

            return $this->redirect($request->headers->get('referer'));
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
    public function downloadAction(Request $request, Project $project, AbstractStep $step): BinaryFileResponse|JsonResponse
    {
        $this->denyAccessUnlessGranted(ProjectVoter::EDIT, $project);

        $filePath = 'true' === $request->query->get('simplified')
            ? $this->contributionsFilePathResolver->getSimplifiedExportPath($step)
            : $this->contributionsFilePathResolver->getFullExportPath($step);

        try {
            $response = $this->file($filePath);
            $response->headers->set('Content-Type', 'text/csv' . '; charset=utf-8');

            return $response;
        } catch (FileNotFoundException) {
            return new JsonResponse(
                ['errorTranslationKey' => 'project.download.not_yet_generated'],
                404
            );
        }
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
}
