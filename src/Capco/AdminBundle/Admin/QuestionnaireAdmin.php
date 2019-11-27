<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Repository\QuestionnaireAbstractQuestionRepository;
use Doctrine\DBAL\Query\QueryBuilder;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Capco\AppBundle\Enum\ProjectVisibilityMode;

class QuestionnaireAdmin extends CapcoAdmin
{
    protected $datagridValues = ['_sort_order' => 'ASC', '_sort_by' => 'title'];

    protected $formOptions = ['cascade_validation' => true];
    private $tokenStorage;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        TokenStorageInterface $tokenStorage
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->tokenStorage = $tokenStorage;
    }

    public function preUpdate($object)
    {
        // We must make sure a question position by questionnaire is unique
        $questionRepo = $this->getConfigurationPool()
            ->getContainer()
            ->get(QuestionnaireAbstractQuestionRepository::class);
        $delta = $questionRepo->getCurrentMaxPositionForQuestionnaire($object->getId());

        foreach ($object->getQuestions() as $question) {
            $question->setPosition($question->getPosition() + $delta);
        }
    }

    /**
     * if user is supper admin return all else return only what I can see.
     */
    public function createQuery($context = 'list')
    {
        $user = $this->tokenStorage->getToken()->getUser();
        if ($user->hasRole('ROLE_SUPER_ADMIN')) {
            return parent::createQuery($context);
        }

        /** @var QueryBuilder $query */
        $query = parent::createQuery($context);
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
            );
        $query->orWhere(
            $query->expr()->gte('p.visibility', ProjectVisibilityMode::VISIBILITY_ADMIN)
        );
        // if questionnaire is just be created, it's not linked to a step, but we need to display it
        $query->orWhere($query->getRootAliases()[0] . '.step IS NULL');
        $query->setParameter('author', $user);

        return $query;
    }

    // Fields to be shown on create/edit forms
    protected function configureFormFields(FormMapper $formMapper)
    {
    }

    // Fields to be shown on filter forms
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, ['label' => 'admin.fields.questionnaire.title'])
            ->add('updatedAt', null, ['label' => 'global.maj']);
    }

    // Fields to be shown on lists
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, ['label' => 'admin.fields.questionnaire.title'])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('_action', 'actions', [
                'actions' => ['show' => [], 'edit' => [], 'delete' => []]
            ]);
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, ['label' => 'admin.fields.questionnaire.title'])
            ->add('enabled', null, ['label' => 'admin.fields.questionnaire.enabled'])
            ->add('createdAt', null, ['label' => 'global.maj'])
            ->add('updatedAt', null, ['label' => 'global.maj']);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('create');
    }
}
