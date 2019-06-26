<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Doctrine\ORM\QueryBuilder;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Capco\AppBundle\Enum\ProjectVisibilityMode;

class ProposalFormAdmin extends CapcoAdmin
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
        // if proposal form is just be created, it's not linked to a step, but we need to display it
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
            ->add('title', null, ['label' => 'admin.fields.proposal_form.title'])
            ->add('step', null, ['label' => 'project'], 'entity', [
                'query_builder' => $this->filterByCollectStepQuery(),
            ])
            ->add('updatedAt', null, ['label' => 'admin.fields.proposal_form.updated_at']);
    }

    // Fields to be shown on lists
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, ['label' => 'admin.fields.proposal_form.title'])
            ->add('project', 'sonata_type_model', [
                'label' => 'project',
                'template' => 'CapcoAdminBundle:ProposalForm:project_show_field.html.twig',
            ])
            ->add('createdAt', null, ['label' => 'admin.fields.proposal_form.created_at'])
            ->add('updatedAt', null, ['label' => 'admin.fields.proposal_form.updated_at'])
            ->add('_action', 'actions', [
                'actions' => [
                    'duplicate' => [
                        'template' =>
                            'CapcoAdminBundle:ProposalForm:list__action_duplicate.html.twig',
                    ],
                    'delete' => [],
                ],
            ]);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->add('duplicate');
        $collection->clearExcept(['batch', 'list', 'edit', 'delete', 'duplicate']);
    }

    private function filterByCollectStepQuery(): QueryBuilder
    {
        return $this->modelManager->createQuery(CollectStep::class, 'p')->select('p');
    }
}
