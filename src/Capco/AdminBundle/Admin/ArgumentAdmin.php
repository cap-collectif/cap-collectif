<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Argument;
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
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ArgumentAdmin extends AbstractAdmin
{
    protected ?string $classnameLabel = 'argument';
    protected array $datagridValues = ['_sort_order' => 'DESC', '_sort_by' => 'updatedAt'];

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        private readonly TokenStorageInterface $tokenStorage
    ) {
        parent::__construct($code, $class, $baseControllerName);
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
                        $query->expr()->eq(':author', 'authors.user'),
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
            ->add('type', null, ['label' => 'admin.fields.argument.type'])
            ->add('opinion', null, ['label' => 'global.proposal'])
            ->add('author', ModelAutocompleteFilter::class, [
                'field_options' => [
                    'label' => 'global.author',
                    'property' => 'username,email',
                    'to_string_callback' => function ($entity) {
                        return $entity->getEmail() . ' - ' . $entity->getUsername();
                    },
                ],
            ])
            ->add('updatedAt', null, ['label' => 'global.maj'])
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
            ->addIdentifier('body', null, [
                'label' => 'global.contenu',
                'template' => '@CapcoAdmin/common/body_list_field.html.twig',
                'route' => [
                    'name' => 'edit',
                ],
            ])
            ->add('type', null, [
                'label' => 'admin.fields.argument.type',
                'template' => '@CapcoAdmin/Argument/type_list_field.html.twig',
                'typesLabels' => Argument::$argumentTypesLabels,
            ])
            ->add('opinion', ModelType::class, [
                'label' => 'global.proposal',
                'template' => '@CapcoAdmin/common/opinion_list_field.html.twig',
            ])
            ->add('author', ModelType::class, [
                'label' => 'global.author',
                'template' => '@CapcoAdmin/common/author_list_field.html.twig',
            ])
            ->add('project', ModelType::class, [
                'label' => 'global.participative.project.label',
                'template' => '@CapcoAdmin/Proposal/project_list_field.html.twig',
            ])
            ->add('votesCount', null, ['label' => 'global.vote.count.label'])
            ->add('published', null, [
                'editable' => false,
                'label' => 'global.published',
            ])
            ->add('trashedStatus', null, [
                'label' => 'global.is_trashed',
                'template' => '@CapcoAdmin/Trashable/trashable_status.html.twig',
            ])
            ->add('updatedAt', 'datetime', ['label' => 'global.maj'])
            ->add('_action', 'actions', [
                'label' => 'link_actions',
                'actions' => ['show' => [], 'edit' => [], 'delete' => []],
            ])
        ;
    }

    protected function configureFormFields(FormMapper $form): void
    {
        $form
            ->add('type', ChoiceType::class, [
                'label' => 'admin.fields.argument.type',
                'choices' => array_flip(Argument::$argumentTypesLabels),
                'translation_domain' => 'CapcoAppBundle',
            ])
            ->add('published', null, [
                'label' => 'global.published',
                'disabled' => true,
                'attr' => ['readonly' => true],
            ])
            ->add('opinion', ModelAutocompleteType::class, [
                'label' => 'global.proposal',
                'property' => 'title',
            ])
            ->add('author', ModelAutocompleteType::class, [
                'label' => 'global.author',
                'property' => 'username,email',
                'to_string_callback' => function ($entity) {
                    return $entity->getEmail() . ' - ' . $entity->getUsername();
                },
            ])
            ->add('body', null, ['label' => 'global.contenu', 'attr' => ['rows' => 10]])
            ->add('trashedStatus', TrashedStatusType::class, [
                'label' => 'global.is_trashed',
            ])
            ->add('trashedReason', null, [
                'label' => 'global.trashed_reason',
                'required' => false,
            ])
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
    }
}
