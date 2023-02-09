<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Form\Type\TrashedStatusType;
use Capco\AppBundle\Repository\OpinionTypeRepository;
use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Datagrid\ProxyQueryInterface;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\ModelListType;
use Sonata\AdminBundle\Form\Type\ModelType;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Sonata\DoctrineORMAdminBundle\Filter\ModelAutocompleteFilter;
use Sonata\Form\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class OpinionAdmin extends CapcoAdmin
{
    protected ?string $classnameLabel = 'proposal';
    protected array $datagridValues = ['_sort_order' => 'ASC', '_sort_by' => 'title'];

    protected array $formOptions = ['cascade_validation' => true];
    private TokenStorageInterface $tokenStorage;
    private OpinionTypeRepository $opinionTypeRepository;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        TokenStorageInterface $tokenStorage,
        OpinionTypeRepository $opinionTypeRepository
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->tokenStorage = $tokenStorage;
        $this->opinionTypeRepository = $opinionTypeRepository;
    }

    public function getPersistentParameters(): array
    {
        $opinionTypeId =
            $this->hasSubject() && $this->getSubject()->getOpinionType()
                ? $this->getSubject()
                    ->getOpinionType()
                    ->getId()
                : $this->getRequest()->get('opinion_type_id');

        return ['opinion_type' => $opinionTypeId];
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
            ->innerJoin($query->getRootAliases()[0] . '.consultation', 'oc')
            ->innerJoin('oc.step', 's')
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

    public function getNewInstance(): object
    {
        /** @var Opinion $opinion */
        $opinion = parent::getNewInstance();

        if ($opinionTypeId = $this->getRequest()->get('opinion_type')) {
            $opinionType = $this->opinionTypeRepository->find($opinionTypeId);
            $opinion->setConsultation($opinionType ? $opinionType->getConsultation() : null);
        }

        return $opinion;
    }

    protected function configureDatagridFilters(DatagridMapper $filter): void
    {
        $filter
            ->add('id', null, ['label' => 'admin.fields.opinion.id'])
            ->add('title', null, ['label' => 'global.title'])
            ->add('author', ModelAutocompleteFilter::class, [
                'field_options' => [
                    'label' => 'global.author',
                    'property' => 'email,username',
                    'to_string_callback' => function ($entity) {
                        return $entity->getEmail() . ' - ' . $entity->getUsername();
                    },
                ],
            ])
            ->add('consultation.step.projectAbstractStep.project', null, [
                'label' => 'global.participative.project.label',
            ])
            ->add('consultation', null, ['label' => 'global.consultation'])
            ->add('OpinionType', null, ['label' => 'global.category'])
            ->add('published', null, ['label' => 'global.published'])
            ->add('pinned', null, ['label' => 'admin.fields.comment.pinned'])
            ->add('trashedStatus', null, ['label' => 'global.is_trashed'])
            ->add('updatedAt', null, ['label' => 'global.maj']);
    }

    protected function configureListFields(ListMapper $list): void
    {
        $list
            ->add('id', null, ['label' => 'admin.fields.opinion.id'])
            ->addIdentifier('title', null, [
                'label' => 'global.title',
                'template' => 'CapcoAdminBundle:common:title_list_field.html.twig',
            ])
            ->add('author', ModelType::class, [
                'label' => 'global.author',
                'template' => 'CapcoAdminBundle:common:author_list_field.html.twig',
            ])
            ->add('project', ModelType::class, [
                'label' => 'global.participative.project.label',
                'template' => 'CapcoAdminBundle:Proposal:project_list_field.html.twig',
            ])
            ->add('OpinionType', null, ['label' => 'global.category'])
            ->add('consultation', ModelType::class, [
                'label' => 'global.consultation',
            ])
            ->add('dummy', IntegerType::class, [
                'label' => 'global.vote',
                'mapped' => false,
                'template' => 'CapcoAdminBundle:Opinion:vote_count_list_field.html.twig',
            ])
            ->add('position', null, ['label' => 'global.position'])
            ->add('published', null, [
                'editable' => false,
                'label' => 'global.published',
            ])
            ->add('pinned', null, ['editable' => true, 'label' => 'global.pinned.label'])
            ->add('trashedStatus', null, [
                'label' => 'global.is_trashed',
                'template' => 'CapcoAdminBundle:Trashable:trashable_status.html.twig',
            ])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('_action', 'actions', [
                'label' => 'link_actions',
                'actions' => ['edit' => [], 'delete' => []],
            ]);
    }

    protected function configureFormFields(FormMapper $form): void
    {
        $subjectHasAppendices = $this->hasSubject()
            ? $this->getSubject()
                    ->getAppendices()
                    ->count() > 0
            : null;
        $disabled = $this->hasSubject() && null !== $this->getSubject()->getId();
        $classname = $subjectHasAppendices ? '' : 'hidden';
        $form
            ->with('admin.fields.opinion.group_content', ['class' => 'col-md-12'])
            ->end()
            ->with('admin.fields.opinion.group_appendices', ['class' => 'col-md-12 ' . $classname])
            ->end()
            ->with('admin.fields.opinion.group_publication', ['class' => 'col-md-12'])
            ->end()
            ->with('admin.fields.opinion.group_answer', ['class' => 'col-md-12'])
            ->end()
            ->end();
        // Content
        // Appendices
        // Publication
        // Answer
        $form
            ->with('admin.fields.opinion.group_content')
            ->add('title', null, ['label' => 'global.title'])
            ->add('author', null, ['label' => 'global.author'])
            ->add('position', null, [
                'label' => 'global.position',
                'required' => false,
            ])
            ->add('body', CKEditorType::class, [
                'label' => 'global.contenu',
                'config_name' => 'admin_editor',
            ])
            ->add('consultation', null, [
                'disabled' => $disabled,
                'label' => 'global.consultation',
                'required' => true,
            ])
            ->end()
            ->with('admin.fields.opinion.group_appendices')
            ->add('appendices', CollectionType::class, [
                'label' => 'global.context.elements',
                'by_reference' => false,
                'required' => false,
                'btn_add' => false,
                'type_options' => ['delete' => false, 'btn_add' => false],
                'attr' => ['class' => $classname],
            ])
            ->end()
            ->with('admin.fields.opinion.group_publication')
            ->add('published', null, [
                'label' => 'global.published',
                'disabled' => true,
                'attr' => ['readonly' => true],
            ])
            ->add('pinned', null, [
                'label' => 'admin.fields.comment.pinned',
                'required' => false,
            ])
            ->add('trashedStatus', TrashedStatusType::class, [
                'label' => 'global.is_trashed',
            ])
            ->add('trashedReason', null, ['label' => 'global.trashed_reason'])
            ->end()
            ->with('admin.fields.opinion.group_answer')
            ->add('answer', ModelListType::class, [
                'btn_list' => false,
                'label' => 'official.answer',
                'required' => false,
            ])
            ->end();
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['list', 'create', 'edit', 'delete', 'export']);
    }
}
