<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\UserBundle\Entity\User;
use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Datagrid\ProxyQueryInterface;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\ModelListType;
use Sonata\AdminBundle\Form\Type\ModelType;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Capco\AppBundle\Form\Type\TrashedStatusType;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\DoctrineORMAdminBundle\Filter\ModelAutocompleteFilter;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Sonata\AdminBundle\Form\Type\ModelAutocompleteType;

class OpinionVersionAdmin extends AbstractAdmin
{
    protected ?string $classnameLabel = 'opinion_version';
    protected array $datagridValues = ['_sort_order' => 'ASC', '_sort_by' => 'title'];
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

    public function getBatchActions(): array
    {
        return [];
    }

    /**
     * if user is supper admin return all else return only what I can see.
     */
    public function createQuery(): ProxyQueryInterface
    {
        $user = $this->tokenStorage->getToken() ? $this->tokenStorage->getToken()->getUser() : null;
        if ($user && $user->hasRole('ROLE_SUPER_ADMIN')) {
            return parent::createQuery();
        }

        $query = parent::createQuery();

        $query
            ->leftJoin($query->getRootAliases()[0] . '.parent', 'pa')
            ->innerJoin('pa.consultation', 'pac')
            ->innerJoin('pac.step', 's')
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

    protected function configureDatagridFilters(DatagridMapper $filter): void
    {
        $filter
            ->add('title', null, ['label' => 'global.title'])
            ->add('body', null, ['label' => 'global.contenu'])
            ->add('comment', null, ['label' => 'global.explanation'])
            ->add('author', ModelAutocompleteFilter::class, [
                'field_options' => [
                    'label' => 'global.author',
                    'property' => 'email,username',
                    'to_string_callback' => function (User $entity) {
                        return $entity->getEmail() . ' - ' . $entity->getUsername();
                    },
                ],
            ])
            ->add('parent', null, ['label' => 'admin.fields.opinion_version.parent'])
            ->add('published', null, ['label' => 'global.published'])
            ->add('trashedStatus', null, ['label' => 'global.is_trashed'])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('parent.consultation.step.projectAbstractStep.project', null, [
                'label' => 'global.participative.project.label',
            ]);
    }

    protected function configureListFields(ListMapper $list): void
    {
        $list
            ->addIdentifier('title', null, [
                'label' => 'global.title',
                'template' => 'CapcoAdminBundle:common:title_list_field.html.twig',
            ])
            ->add('body', null, [
                'label' => 'global.contenu',
                'template' => 'CapcoAdminBundle:common:body_list_field.html.twig',
            ])
            ->add('comment', null, ['label' => 'global.explanation'])
            ->add('author', null, [
                'label' => 'global.author',
                'template' => 'CapcoAdminBundle:common:author_list_field.html.twig',
            ])
            ->add('project', ModelType::class, [
                'label' => 'global.participative.project.label',
                'template' => 'CapcoAdminBundle:Proposal:project_list_field.html.twig',
            ])
            ->add('parent', null, [
                'label' => 'admin.fields.opinion_version.parent',
                'template' => 'CapcoAdminBundle:OpinionVersion:parent_list_field.html.twig',
            ])
            ->add('published', null, [
                'label' => 'global.published',
                'editable' => false,
            ])
            ->add('trashedStatus', null, [
                'label' => 'global.is_trashed',
                'template' => 'CapcoAdminBundle:Trashable:trashable_status.html.twig',
            ])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('_action', 'actions', [
                'label' => 'link_actions',
                'actions' => ['delete' => []],
            ]);
    }

    protected function configureFormFields(FormMapper $form): void
    {
        $form
            ->with('global.contenu', ['class' => 'col-md-12'])
            ->end()
            ->with('admin.fields.opinion_version.group_publication', ['class' => 'col-md-12'])
            ->end()
            ->with('admin.fields.opinion_version.group_answer', ['class' => 'col-md-12'])
            ->end()
            ->end();
        $form
            ->with('global.contenu')
            ->add('title', null, ['label' => 'global.title'])
            ->add('author', ModelAutocompleteType::class, [
                'label' => 'global.author',
                'property' => 'username,email',
                'to_string_callback' => function (User $entity) {
                    return $entity->getEmail() . ' - ' . $entity->getUsername();
                },
            ])
            ->add('parent', ModelType::class, ['label' => 'admin.fields.opinion_version.parent'])
            ->add('body', CKEditorType::class, [
                'label' => 'global.contenu',
                'config_name' => 'admin_editor',
            ])
            ->add('comment', CKEditorType::class, [
                'label' => 'global.explanation',
                'config_name' => 'admin_editor',
            ])
            ->end()

            ->with('admin.fields.opinion_version.group_publication')
            ->add('published', null, [
                'label' => 'global.published',
                'disabled' => true,
                'attr' => ['readonly' => true],
            ])
            ->add('trashedStatus', TrashedStatusType::class, [
                'label' => 'global.is_trashed',
            ])
            ->add('trashedReason', null, ['label' => 'global.trashed_reason'])
            ->end()

            ->with('admin.fields.opinion_version.group_answer')
            ->add('answer', ModelListType::class, [
                'label' => 'official.answer',
                'btn_list' => false,
                'required' => false,
            ])
            ->end();
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['list', 'create', 'edit', 'delete', 'show']);
    }

    protected function configureShowFields(ShowMapper $show): void
    {
    }
}
