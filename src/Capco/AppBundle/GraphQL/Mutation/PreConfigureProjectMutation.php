<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Interfaces\Owner;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Form\Persister\PreConfigureProjectAnalysisFormPersister;
use Capco\AppBundle\Form\Persister\PreConfigureProjectProjectPersister;
use Capco\AppBundle\Form\Persister\PreConfigureProjectProposalFormPersister;
use Capco\AppBundle\Form\Persister\PreConfigureProjectQuestionnairePersister;
use Capco\AppBundle\GraphQL\Mutation\ProposalForm\DeleteProposalFormMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ProjectTypeRepository;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class PreConfigureProjectMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly EntityManagerInterface $em, private readonly GlobalIdResolver $globalIdResolver, private readonly PreConfigureProjectQuestionnairePersister $preConfigureProjectQuestionnairePersister, private readonly PreConfigureProjectProposalFormPersister $preConfigureProjectProposalFormPersister, private readonly PreConfigureProjectProjectPersister $preConfigureProjectProjectPersister, private readonly PreConfigureProjectAnalysisFormPersister $preConfigureProjectAnalysisFormPersister, private readonly DeleteQuestionnaireMutation $deleteQuestionnaireMutation, private readonly DeleteProposalFormMutation $deleteProposalFormMutation, private readonly DeleteProjectMutation $deleteProjectMutation, private readonly AuthorizationCheckerInterface $authorizationChecker, private readonly ProjectTypeRepository $projectTypeRepository, private readonly Indexer $indexer)
    {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $questionnairesInput = $input->offsetGet('questionnaires') ?? [];
        $proposalFormsInput = $input->offsetGet('proposalForms') ?? [];
        $projectInput = $input->offsetGet('project');
        $analysisFormInput = $input->offsetGet('analysisForm') ?? [];

        $questionnaireTitleToIdMap = [];
        $proposalFormTitleToIdMap = [];
        list($ownerId, $owner) = $this->getOwner($viewer);
        $project = $this->createProject($projectInput['title'], $owner);

        if ($projectInput['projectType'] ?? null) {
            $projectInput['projectType'] = $this->projectTypeRepository
                ->findOneBy(['slug' => $projectInput['projectType']])
                ->getId()
            ;
        }

        try {
            $questionnaireTitleToIdMap = $this->preConfigureProjectQuestionnairePersister->addQuestionnaire(
                $questionnairesInput,
                $ownerId,
                $viewer
            );
            $proposalFormTitleToIdMap = $this->preConfigureProjectProposalFormPersister->addProposalForm(
                $proposalFormsInput,
                $ownerId,
                $viewer
            );

            $this->preConfigureProjectProjectPersister->updateProject(
                $projectInput,
                $viewer,
                $project,
                $proposalFormTitleToIdMap,
                $questionnaireTitleToIdMap
            );
            $this->preConfigureProjectAnalysisFormPersister->configureAnalysisForm(
                $analysisFormInput,
                $viewer,
                $project,
                $proposalFormTitleToIdMap,
                $questionnaireTitleToIdMap
            );

            $this->em->flush();

            return ['project' => $project];
        } catch (\Exception $exception) {
            $this->rollback(
                $questionnaireTitleToIdMap,
                $proposalFormTitleToIdMap,
                $project,
                $viewer
            );

            throw new UserError($exception->getMessage());
        }
    }

    public function isGranted(): bool
    {
        return $this->authorizationChecker->isGranted(ProjectVoter::CREATE, new Project());
    }

    private function createProject(string $title, Owner $owner): Project
    {
        $project = (new Project())->setTitle($title)->setOwner($owner);
        $this->em->persist($project);
        $this->em->flush();

        $this->indexer->index(ClassUtils::getClass($project), $project->getId());
        $this->indexer->finishBulk();

        return $project;
    }

    private function getOwner(User $viewer): array
    {
        $ownerId = GlobalId::toGlobalId('User', $viewer->getId());
        if ($viewer->getOrganizationId()) {
            $ownerId = $viewer->getOrganizationId();
        }
        $owner = $this->globalIdResolver->resolve($ownerId, $viewer);

        return [$ownerId, $owner];
    }

    private function rollback(
        array $questionnaireTitleToIdMap,
        array $proposalFormTitleToIdMap,
        Project $project,
        User $viewer
    ): void {
        $this->em->clear();
        foreach ($proposalFormTitleToIdMap as $proposalFormId) {
            $this->deleteProposalFormMutation->__invoke(
                new Argument(['id' => $proposalFormId]),
                $viewer
            );
        }

        $this->em->clear();
        foreach ($questionnaireTitleToIdMap as $questionnaireId) {
            $questionnaireGlobalId = GlobalId::toGlobalId('Questionnaire', $questionnaireId);
            $this->deleteQuestionnaireMutation->__invoke(
                new Argument(['id' => $questionnaireGlobalId]),
                $viewer
            );
        }

        $projectGlobalId = GlobalId::toGlobalId('Project', $project->getId());
        $this->deleteProjectMutation->__invoke(new Argument(['id' => $projectGlobalId]), $viewer);
    }
}
