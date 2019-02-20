<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\PostComment;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Form\Type\TrashedStatusType;
use Sonata\AdminBundle\Route\RouteCollection;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class CommentAdmin extends AbstractAdmin
{
    protected $datagridValues = ['_sort_order' => 'DESC', '_sort_by' => 'updatedAt'];

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

    public function getNewInstance()
    {
        $subClass = $this->getRequest()->query->get('subclass');
        // Workaround for author autocompletion
        $subClass = $subClass ? $subClass : 'post_comment';
        $object = $this->getModelManager()->getModelInstance($this->getSubClass($subClass));
        foreach ($this->getExtensions() as $extension) {
            $extension->alterNewInstance($this, $object);
        }

        return $object;
    }

    public function getTemplate($name)
    {
        if ('list' === $name) {
            return 'CapcoAdminBundle:Comment:list.html.twig';
        }
        if ('edit' === $name) {
            return 'CapcoAdminBundle:Comment:edit.html.twig';
        }

        return $this->getTemplateRegistry()->getTemplate($name);
    }

    public function getViewer()
    {
        return $this->tokenStorage->getToken()->getUser();
    }

    public function isViewerSuperAdmin()
    {
        return \is_object($this->getViewer()) && $this->getViewer()->hasRole('ROLE_SUPER_ADMIN');
    }

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add(
                'Author',
                'doctrine_orm_model_autocomplete',
                ['label' => 'admin.fields.comment.author'],
                null,
                [
                    'property' => 'email,username',
                    'to_string_callback' => function ($enitity, $property) {
                        return $enitity->getEmail() . ' - ' . $enitity->getUsername();
                    },
                ]
            )
            ->add('authorName', null, ['label' => 'admin.fields.comment.author_name'])
            ->add('authorEmail', null, ['label' => 'admin.fields.comment.author_email'])
            ->add('votesCount', null, ['label' => 'admin.fields.comment.vote_count'])
            ->add('updatedAt', null, ['label' => 'admin.fields.comment.updated_at'])
            ->add('published', null, ['label' => 'admin.fields.comment.is_enabled'])
            ->add('trashedStatus', null, ['label' => 'admin.fields.comment.is_trashed'])
            ->add('type', 'doctrine_orm_class', [
                'label' => 'admin.fields.comment.type',
                'sub_classes' => $this->getSubClasses(),
            ]);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $availableActions = [
            'display' => [
                'template' => 'CapcoAdminBundle:CRUD:list__action_display.html.twig',
            ],
        ];

        $availableActions['delete'] = [
            'template' => 'CapcoAdminBundle:Comment:list__action_delete.html.twig',
        ];

        $listMapper
            ->addIdentifier('body', null, [
                'label' => 'admin.fields.comment.body',
                'template' => 'CapcoAdminBundle:Comment:body_list_field.html.twig',
            ])
            ->add('object', null, [
                'label' => 'admin.fields.comment.object',
                'template' => 'CapcoAdminBundle:Comment:object_list_field.html.twig',
                'mapped' => false,
            ])
            ->add('Author', 'sonata_type_model', [
                'label' => 'admin.fields.comment.author',
                'template' => 'CapcoAdminBundle:Comment:author_list_field.html.twig',
                'mapped' => false,
            ])
            ->add('votesCount', null, ['label' => 'admin.fields.comment.vote_count'])
            ->add('published', null, [
                'editable' => false,
                'label' => 'admin.fields.comment.is_enabled',
            ])
            ->add('trashedStatus', null, [
                'label' => 'admin.fields.opinion.is_trashed',
                'template' => 'CapcoAdminBundle:Trashable:trashable_status.html.twig',
            ])
            ->add('updatedAt', 'datetime', ['label' => 'admin.fields.comment.updated_at'])
            ->add('_action', 'actions', [
                'actions' => $availableActions,
            ]);
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $subject = $this->getSubject();

        if ($subject instanceof EventComment) {
            $formMapper->add('event', 'sonata_type_model', [
                'label' => 'admin.fields.comment.idea',
                'class' => Event::class,
            ]);
        } elseif ($subject instanceof PostComment) {
            $formMapper->add('post', 'sonata_type_model', [
                'label' => 'admin.fields.comment.idea',
                'class' => Post::class,
            ]);
        }

        $formMapper
            ->add('body', null, ['label' => 'admin.fields.comment.body', 'attr' => ['rows' => 8]])
            ->add('Author', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.comment.author',
                'property' => 'username,email',
                'to_string_callback' => function ($enitity, $property) {
                    return $enitity->getEmail() . ' - ' . $enitity->getUsername();
                },
                'help' => 'admin.help.comment.author',
                'required' => false,
            ])
            ->add('authorName', null, ['label' => 'admin.fields.comment.author_name'])
            ->add('authorEmail', null, ['label' => 'admin.fields.comment.author_email'])
            ->add('published', null, [
                'label' => 'admin.fields.comment.is_enabled',
                'disabled' => true,
                'attr' => ['readonly' => true],
            ])
            ->add('trashedStatus', TrashedStatusType::class, [
                'label' => 'admin.fields.opinion.is_trashed',
            ])
            ->add('trashedReason', null, ['label' => 'admin.fields.comment.trashed_reason'])
            ->add('pinned', null, ['label' => 'admin.fields.comment.pinned', 'required' => false]);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['batch', 'list', 'create', 'edit', 'delete', 'show']);
        $collection->add('preview', $this->getRouterIdParameter() . '/preview');
    }
}
