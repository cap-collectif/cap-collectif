<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Datagrid\ProxyQueryInterface;
use Sonata\AdminBundle\Form\Type\ModelType;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\DoctrineORMAdminBundle\Filter\ModelAutocompleteFilter;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ReplyAdmin extends AbstractAdmin
{
    protected ?string $classnameLabel = 'reply';
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
            ->leftJoin($query->getRootAliases()[0] . '.questionnaire', 'q')
            ->leftJoin('q.step', 's')
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
        $query->setParameter('author', $user);

        return $query;
    }

    protected function configureDatagridFilters(DatagridMapper $filter): void
    {
        $filter
            ->add('id', null, ['label' => 'admin.fields.reply.id'])
            ->add('author', ModelAutocompleteFilter::class, [
                'field_options' => [
                    'label' => 'global.author',
                    'property' => 'email,username',
                    'to_string_callback' => function ($entity) {
                        return $entity->getEmail() . ' - ' . $entity->getUsername();
                    },
                ],
            ])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('questionnaire.step', null, ['label' => 'global.questionnaire'])
            ->add('questionnaire.step.projectAbstractStep.project', null, [
                'label' => 'global.participative.project.label',
            ])
            ->add('draft', null, ['label' => 'proposal.state.draft'])
            ->add('published', null, ['label' => 'global.published'])
        ;
    }

    protected function configureListFields(ListMapper $list): void
    {
        //$this->setTemplate(
        $list
            ->addIdentifier('id', null, ['label' => 'admin.fields.reply.id'])
            ->add('author', ModelType::class, [
                'label' => 'global.author',
                'template' => 'CapcoAdminBundle:common:author_list_field.html.twig',
            ])
            ->add('project', ModelType::class, [
                'label' => 'global.participative.project.label',
                'template' => 'CapcoAdminBundle:Proposal:project_list_field.html.twig',
            ])
            ->add('state', null, [
                'mapped' => false,
                'label' => 'global.state',
                'template' => 'CapcoAdminBundle:Reply:state_list_field.html.twig',
            ])
            ->add('createdAt', null, ['label' => 'global.creation'])
            ->add('updatedAt', null, ['label' => 'global.maj'])
        ;
    }

    protected function configureShowFields(ShowMapper $show): void
    {
        $show
            ->add('id', null, ['label' => 'admin.fields.reply.id'])
            ->add('author', ModelType::class, [
                'label' => 'global.author',
                'template' => 'CapcoAdminBundle:Reply:author_show_field.html.twig',
            ])
            ->add('createdAt', null, ['label' => 'global.creation'])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('status', null, [
                'label' => 'global.state',
                'template' => 'CapcoAdminBundle:Reply:state_show_field.html.twig',
            ])
            ->add('responses', null, [
                'label' => 'admin.fields.reply.responses',
                'template' => 'CapcoAdminBundle:Reply:responses_show_field.html.twig',
            ])
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->remove('create');
        $collection->remove('list');
        $collection->remove('edit');
    }
}
