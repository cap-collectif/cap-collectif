<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Form\Type\TrashedStatusType;
use Capco\AppBundle\Repository\OpinionTypeRepository;
use Doctrine\ORM\QueryBuilder;
use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\ModelAutocompleteType;
use Sonata\AdminBundle\Form\Type\ModelListType;
use Sonata\AdminBundle\Form\Type\ModelType;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\DoctrineORMAdminBundle\Filter\ModelAutocompleteFilter;
use Sonata\Form\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class OpinionAdmin extends CapcoAdmin
{
    protected $datagridValues = ['_sort_order' => 'ASC', '_sort_by' => 'title'];

    protected $formOptions = ['cascade_validation' => true];
    private $tokenStorage;
    private $opinionTypeRepository;

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

    public function getTemplate($name)
    {
        if ('list' === $name) {
            return 'CapcoAdminBundle:Opinion:list.html.twig';
        }
        if ('edit' === $name) {
            return 'CapcoAdminBundle:Opinion:edit.html.twig';
        }
        if ('delete' === $name) {
            return 'CapcoAdminBundle:Opinion:delete.html.twig';
        }

        return $this->getTemplateRegistry()->getTemplate($name);
    }

    public function getPersistentParameters()
    {
        $subject = $this->getSubject();
        $opinionTypeId = null;

        if ($subject && $subject->getOpinionType()) {
            $opinionTypeId = $subject->getOpinionType()->getId();
        } else {
            $opinionTypeId = $this->getRequest()->get('opinion_type_id');
        }

        return ['opinion_type' => $opinionTypeId];
    }

    public function getBatchActions()
    {
    }

    /**
     * if user is supper admin return all else return only what I can see.
     */
    public function createQuery($context = 'list')
    {
        $user = $this->tokenStorage->getToken() ? $this->tokenStorage->getToken()->getUser() : null;
        if ($user && $user->hasRole('ROLE_SUPER_ADMIN')) {
            return parent::createQuery($context);
        }

        /** @var QueryBuilder $query */
        $query = parent::createQuery($context);

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

    public function getNewInstance()
    {
        /** @var Opinion $opinion */
        $opinion = parent::getNewInstance();

        if ($opinionTypeId = $this->request->get('opinion_type')) {
            $opinionType = $this->opinionTypeRepository->find($opinionTypeId);
            $opinion->setConsultation($opinionType ? $opinionType->getConsultation() : null);
        }

        return $opinion;
    }

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('id', null, ['label' => 'admin.fields.opinion.id'])
            ->add('title', null, ['label' => 'global.title'])
            ->add('Author', ModelAutocompleteFilter::class, ['label' => 'global.author'], null, [
                'property' => 'email,username',
                'to_string_callback' => function ($enitity, $property) {
                    return $enitity->getEmail() . ' - ' . $enitity->getUsername();
                }
            ])
            ->add('consultation', null, ['label' => 'global.consultation'])
            ->add('OpinionType', null, ['label' => 'global.category'])
            ->add('published', null, ['label' => 'global.published'])
            ->add('pinned', null, ['label' => 'admin.fields.comment.pinned'])
            ->add('trashedStatus', null, ['label' => 'global.is_trashed'])
            ->add('updatedAt', null, ['label' => 'global.maj']);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->add('id', null, ['label' => 'admin.fields.opinion.id'])
            ->addIdentifier('title', null, ['label' => 'global.title'])
            ->add('Author', ModelType::class, ['label' => 'global.author'])
            ->add('OpinionType', null, ['label' => 'global.category'])
            ->add('consultation', ModelType::class, [
                'label' => 'global.consultation'
            ])
            ->add('voteCountTotal', IntegerType::class, [
                'label' => 'global.vote',
                'mapped' => false,
                'template' => 'CapcoAdminBundle:Opinion:vote_count_list_field.html.twig'
            ])
            ->add('position', null, ['label' => 'global.position'])
            ->add('published', null, [
                'editable' => false,
                'label' => 'global.published'
            ])
            ->add('pinned', null, ['editable' => true, 'label' => 'global.pinned.label'])
            ->add('trashedStatus', null, [
                'label' => 'global.is_trashed',
                'template' => 'CapcoAdminBundle:Trashable:trashable_status.html.twig'
            ])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('_action', 'actions', [
                'actions' => ['show' => [], 'edit' => [], 'delete' => []]
            ]);
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $subjectHasAppendices = $this->getSubject()
            ? $this->getSubject()
                    ->getAppendices()
                    ->count() > 0
            : null;

        $classname = $subjectHasAppendices ? '' : 'hidden';
        $formMapper
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
        $formMapper
            ->with('admin.fields.opinion.group_content')
            ->add('title', null, ['label' => 'global.title'])
            ->add('Author', ModelAutocompletetype::class, [
                'label' => 'global.author',
                'property' => 'username,email',
                'to_string_callback' => function ($enitity, $property) {
                    return $enitity->getEmail() . ' - ' . $enitity->getUsername();
                }
            ])
            ->add('position', null, [
                'label' => 'global.position',
                'required' => false
            ])
            ->add('body', CKEditorType::class, [
                'label' => 'global.contenu',
                'config_name' => 'admin_editor'
            ])
            ->add('consultation', ModelAutocompleteType::class, [
                'label' => 'global.consultation',
                'property' => 'title',
                'required' => true
            ])
            ->end()
            ->with('admin.fields.opinion.group_appendices')
            ->add('appendices', CollectionType::class, [
                'label' => 'global.context.elements',
                'by_reference' => false,
                'required' => false,
                'btn_add' => false,
                'type_options' => ['delete' => false, 'btn_add' => false],
                'attr' => ['class' => $classname]
            ])
            ->end()
            ->with('admin.fields.opinion.group_publication')
            ->add('published', null, [
                'label' => 'global.published',
                'disabled' => true,
                'attr' => ['readonly' => true]
            ])
            ->add('pinned', null, [
                'label' => 'admin.fields.comment.pinned',
                'required' => false
            ])
            ->add('trashedStatus', TrashedStatusType::class, [
                'label' => 'global.is_trashed'
            ])
            ->add('trashedReason', null, ['label' => 'global.trashed_reason'])
            ->end()
            ->with('admin.fields.opinion.group_answer')
            ->add('answer', ModelListType::class, [
                'btn_list' => false,
                'label' => 'official.answer',
                'required' => false
            ])
            ->end();
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['list', 'create', 'edit', 'delete', 'export', 'show']);
    }
}
