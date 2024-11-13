<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Form\Type\TrashedStatusType;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Datagrid\ProxyQueryInterface;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\ModelAutocompleteType;
use Sonata\AdminBundle\Form\Type\ModelType;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Sonata\DoctrineORMAdminBundle\Filter\ModelAutocompleteFilter;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class SourceAdmin extends AbstractAdmin
{
    protected ?string $classnameLabel = 'source';
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
            ->leftJoin($query->getRootAliases()[0] . '.opinion', 'op')
            ->innerJoin('op.consultation', 'opc')
            ->innerJoin('opc.step', 's')
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
            ->add('title', null, ['label' => 'global.title'])
            ->add('body', null, ['label' => 'global.contenu'])
            ->add('author', ModelAutocompleteFilter::class, [
                'field_options' => [
                    'label' => 'global.author',
                    'property' => 'email,username',
                    'to_string_callback' => function ($entity) {
                        return $entity->getEmail() . ' - ' . $entity->getUsername();
                    },
                ],
            ])
            ->add('opinion', null, ['label' => 'global.proposal'])
            ->add('category', null, ['label' => 'global.type'])
            ->add('link', null, ['label' => 'global.link'])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('createdAt', null, ['label' => 'global.creation'])
            ->add('published', null, ['label' => 'global.published'])
            ->add('trashedStatus', null, ['label' => 'global.is_trashed'])
            ->add('opinion.consultation.step.projectAbstractStep.project', null, [
                'label' => 'global.participative.project.label',
            ])
        ;
    }

    protected function configureListFields(ListMapper $list): void
    {
        $list
            ->addIdentifier('title', null, [
                'label' => 'global.title',
                'template' => '@CapcoAdmin/common/title_list_field.html.twig',
                'route' => [
                    'name' => 'edit',
                ],
            ])
            ->add('author', ModelType::class, [
                'label' => 'global.author',
                'template' => '@CapcoAdmin/common/author_list_field.html.twig',
            ])
            ->add('project', ModelType::class, [
                'label' => 'global.participative.project.label',
                'template' => '@CapcoAdmin/Proposal/project_list_field.html.twig',
            ])
            ->add('opinion', ModelType::class, [
                'label' => 'global.proposal',
                'template' => '@CapcoAdmin/common/opinion_list_field.html.twig',
            ])
            ->add('category', ModelType::class, ['label' => 'global.type'])
            ->add('votesCount', null, ['label' => 'global.vote.count.label'])
            ->add('published', null, [
                'editable' => false,
                'label' => 'global.published',
            ])
            ->add('trashedStatus', null, [
                'template' => '@CapcoAdmin/Trashable/trashable_status.html.twig',
                'label' => 'global.is_trashed',
            ])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('_action', 'actions', [
                'label' => 'link_actions',
                'actions' => ['delete' => []],
            ])
        ;
    }

    protected function configureFormFields(FormMapper $form): void
    {
        $form
            ->add('title', null, ['label' => 'global.title'])
            ->add('published', null, [
                'label' => 'global.published',
                'disabled' => true,
                'attr' => ['readonly' => true],
            ])
            ->add('body', null, ['label' => 'global.contenu'])
            ->add('author', ModelAutocompleteType::class, [
                'label' => 'global.author',
                'property' => 'username,email',
                'to_string_callback' => function ($entity) {
                    return $entity->getEmail() . ' - ' . $entity->getUsername();
                },
            ])
            ->add('opinion', ModelType::class, ['label' => 'global.proposal'])
            ->add('category', ModelType::class, ['label' => 'global.type'])
            ->add('link', null, [
                'label' => 'global.link',
                'attr' => ['placeholder' => 'http://www.cap-collectif.com/'],
            ])
            ->add('trashedStatus', TrashedStatusType::class, [
                'label' => 'global.is_trashed',
            ])
            ->add('trashedReason', null, [
                'label' => 'admin.fields.comment.trashed_reason',
                'required' => false,
            ])
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
    }
}
