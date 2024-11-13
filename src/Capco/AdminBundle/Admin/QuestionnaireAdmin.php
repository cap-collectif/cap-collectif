<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Repository\QuestionnaireAbstractQuestionRepository;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Datagrid\ProxyQueryInterface;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Sonata\AdminBundle\Show\ShowMapper;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class QuestionnaireAdmin extends CapcoAdmin
{
    protected ?string $classnameLabel = 'questionnaire';
    protected array $datagridValues = ['_sort_order' => 'ASC', '_sort_by' => 'title'];

    protected array $formOptions = ['cascade_validation' => true];
    private TokenStorageInterface $tokenStorage;
    private QuestionnaireAbstractQuestionRepository $questionnaireAbstractQuestionRepository;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        TokenStorageInterface $tokenStorage,
        QuestionnaireAbstractQuestionRepository $questionnaireAbstractQuestionRepository
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->tokenStorage = $tokenStorage;
        $this->questionnaireAbstractQuestionRepository = $questionnaireAbstractQuestionRepository;
    }

    public function preUpdate($object): void
    {
        // We must make sure a question position by questionnaire is unique
        $delta = $this->questionnaireAbstractQuestionRepository->getCurrentMaxPositionForQuestionnaire(
            $object->getId()
        );

        foreach ($object->getQuestions() as $question) {
            $question->setPosition($question->getPosition() + $delta);
        }
    }

    /**
     * if user is supper admin return all else return only what I can see.
     */
    public function createQuery(): ProxyQueryInterface
    {
        $user = $this->tokenStorage->getToken()->getUser();
        if ($user->hasRole('ROLE_SUPER_ADMIN')) {
            return parent::createQuery();
        }

        $query = parent::createQuery();
        $query
            ->leftJoin($query->getRootAliases()[0] . '.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pAs')
            ->leftJoin('pAs.project', 'p')
            ->leftJoin('p.authors', 'authors')
            ->orWhere(
                $query
                    ->expr()
                    ->andX(
                        $query->expr()->eq('authors.user', ':author'),
                        $query->expr()->eq('p.visibility', ProjectVisibilityMode::VISIBILITY_ME)
                    )
            )
        ;
        $query->orWhere(
            $query->expr()->gte('p.visibility', ProjectVisibilityMode::VISIBILITY_ADMIN)
        );
        // if questionnaire is just be created, it's not linked to a step, but we need to display it
        $query->orWhere($query->getRootAliases()[0] . '.step IS NULL');
        $query->setParameter('author', $user);

        return $query;
    }

    protected function configure(): void
    {
        $this->setTemplate('edit', '@CapcoAdmin/Questionnaire/edit.html.twig');
    }

    // Fields to be shown on create/edit forms
    protected function configureFormFields(FormMapper $form): void
    {
    }

    // Fields to be shown on filter forms
    protected function configureDatagridFilters(DatagridMapper $filter): void
    {
        $filter
            ->add('title', null, ['label' => 'global.title'])
            ->add('updatedAt', null, ['label' => 'global.maj'])
        ;
    }

    // Fields to be shown on lists
    protected function configureListFields(ListMapper $list): void
    {
        $list
            ->addIdentifier('title', null, ['label' => 'global.title'])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('_action', 'actions', [
                'label' => 'link_actions',
                'actions' => ['show' => [], 'edit' => [], 'delete' => []],
            ])
        ;
    }

    protected function configureShowFields(ShowMapper $show): void
    {
        $show
            ->add('title', null, ['label' => 'global.title'])
            ->add('enabled', null, ['label' => 'admin.fields.questionnaire.enabled'])
            ->add('createdAt', null, ['label' => 'global.maj'])
            ->add('updatedAt', null, ['label' => 'global.maj'])
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->remove('create');
    }
}
