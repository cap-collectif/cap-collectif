<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Doctrine\ORM\QueryBuilder;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Datagrid\ProxyQueryInterface;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\ModelType;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ProposalFormAdmin extends CapcoAdmin
{
    protected ?string $classnameLabel = 'proposal_form';
    protected array $datagridValues = ['_sort_order' => 'ASC', '_sort_by' => 'title'];

    protected array $formOptions = ['cascade_validation' => true];
    private TokenStorageInterface $tokenStorage;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        TokenStorageInterface $tokenStorage
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->tokenStorage = $tokenStorage;
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
        // if proposal form is just be created, it's not linked to a step, but we need to display it
        $query->orWhere($query->getRootAliases()[0] . '.step IS NULL');
        $query->setParameter('author', $user);

        if (!$user->isAdmin()) {
            $query
                ->andWhere($query->getRootAliases()[0] . '.owner = :owner')
                ->setParameter('owner', $user)
            ;
        }

        return $query;
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
            ->add(
                'step',
                null,
                ['label' => 'project'],
                [
                    'query_builder' => $this->filterByCollectStepQuery(),
                ]
            )
            ->add('updatedAt', null, ['label' => 'global.maj'])
        ;
    }

    // Fields to be shown on lists
    protected function configureListFields(ListMapper $list): void
    {
        $list
            ->addIdentifier('title', null, ['label' => 'global.title'])
            ->add('project', ModelType::class, [
                'label' => 'project',
                'template' => '@CapcoAdmin/ProposalForm/project_show_field.html.twig',
            ])
            ->add('createdAt', null, ['label' => 'global.creation'])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('_action', 'actions', [
                'label' => 'link_actions',
                'actions' => [
                    'duplicate' => [
                        'template' => '@CapcoAdmin/ProposalForm/list__action_duplicate.html.twig',
                    ],
                    'delete' => [],
                ],
            ])
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->add('duplicate');
        $collection->clearExcept(['batch', 'list', 'edit', 'delete', 'duplicate']);
    }

    protected function configure(): void
    {
        $this->setTemplates([
            'edit' => '@CapcoAdmin/ProposalForm/edit.html.twig',
            'list' => '@CapcoAdmin/ProposalForm/list.html.twig',
        ]);
    }

    private function filterByCollectStepQuery(): QueryBuilder
    {
        return $this->getModelManager()
            ->createQuery(CollectStep::class, 'p')
            ->select('p')
        ;
    }
}
