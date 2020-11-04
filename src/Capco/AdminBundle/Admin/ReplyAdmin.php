<?php

namespace Capco\AdminBundle\Admin;

use Doctrine\DBAL\Query\QueryBuilder;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\DoctrineORMAdminBundle\Filter\ModelAutocompleteFilter;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Sonata\AdminBundle\Form\Type\ModelType;

class ReplyAdmin extends AbstractAdmin
{
    protected $classnameLabel = 'reply';
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
            );
        $query->orWhere(
            $query->expr()->gte('p.visibility', ProjectVisibilityMode::VISIBILITY_ADMIN)
        );
        $query->setParameter('author', $user);

        return $query;
    }

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('id', null, ['label' => 'admin.fields.reply.id'])
            ->add('author', ModelAutocompleteFilter::class, ['label' => 'global.author'], null, [
                'property' => 'email,username',
                'to_string_callback' => function ($entity, $property) {
                    return $entity->getEmail() . ' - ' . $entity->getUsername();
                },
            ])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('questionnaire.step', null, ['label' => 'global.questionnaire'])
            ->add('questionnaire.step.projectAbstractStep.project', null, [
                'label' => 'global.participative.project.label',
            ])
            ->add('draft', null, ['label' => 'proposal.state.draft'])
            ->add('published', null, ['label' => 'global.published']);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
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
            ->add('updatedAt', null, ['label' => 'global.maj']);
    }

    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('id', null, ['label' => 'admin.fields.reply.id'])
            ->add('author', ModelType::class, [
                'label' => 'global.author',
                'template' => 'CapcoAdminBundle:Reply:author_list_field.html.twig',
            ])
            ->add('createdAt', null, ['label' => 'global.creation'])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('state', null, [
                'label' => 'global.state',
                'template' => 'CapcoAdminBundle:Reply:state_show_field.html.twig',
            ])
            ->add('responses', null, [
                'label' => 'admin.fields.reply.responses',
                'template' => 'CapcoAdminBundle:Reply:responses_show_field.html.twig',
            ]);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('create');
        $collection->remove('edit');
    }
}
