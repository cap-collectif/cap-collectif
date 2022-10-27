<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\PostComment;
use Capco\AppBundle\Toggle\Manager;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Form\Type\TrashedStatusType;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\DoctrineORMAdminBundle\Filter\ModelAutocompleteFilter;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Sonata\AdminBundle\Form\Type\ModelType;

class CommentAdmin extends AbstractAdmin
{
    protected $classnameLabel = 'comment';
    protected $datagridValues = ['_sort_order' => 'DESC', '_sort_by' => 'updatedAt'];

    private $tokenStorage;
    private Manager $manager;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        TokenStorageInterface $tokenStorage,
        Manager $manager
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->tokenStorage = $tokenStorage;
        $this->manager = $manager;
    }

    public function getNewInstance()
    {
        $subClass = $this->getRequest()->query->get('subclass');
        // Workaround for author autocompletion
        $subClass = $subClass ?: 'post_comment';
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
            ->add('author', ModelAutocompleteFilter::class, ['label' => 'global.author'], null, [
                'property' => 'email,username',
                'to_string_callback' => function ($entity, $property) {
                    return $entity->getEmail() . ' - ' . $entity->getUsername();
                },
            ])
            ->add('authorName', null, ['label' => 'admin.fields.comment.author_name'])
            ->add('authorEmail', null, ['label' => 'admin.fields.comment.author_email'])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('published', null, ['label' => 'global.published'])
            ->add('type', 'doctrine_orm_class', [
                'label' => 'comment.type',
                'sub_classes' => $this->getSubClasses(),
            ]);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $availableActions['delete'] = [
            'template' => 'CapcoAdminBundle:Comment:list__action_delete.html.twig',
        ];

        $isModerationEnabled = $this->manager->isActive(Manager::moderation_comment);

        $listMapper
            ->addIdentifier('body', null, [
                'label' => 'global.contenu',
                'template' => 'CapcoAdminBundle:Comment:body_list_field.html.twig',
            ])
            ->add('object', null, [
                'label' => 'admin.fields.comment.object',
                'template' => 'CapcoAdminBundle:Comment:object_list_field.html.twig',
                'mapped' => false,
            ])
            ->add('author', ModelType::class, [
                'label' => 'global.author',
                'template' => 'CapcoAdminBundle:Comment:author_list_field.html.twig',
                'mapped' => false,
            ])
            ->add('votesCount', null, ['label' => 'global.vote.count.label'])
            ->add('published', null, [
                'editable' => false,
                'label' => 'global.published',
            ]);

        if ($isModerationEnabled) {
            $listMapper->add('moderationStatus', null, [
                'label' => 'moderation',
                'accessor' => function ($subject) {
                    $status = strtolower($subject->getModerationStatus());

                    return $this->translator->trans($status);
                },
            ]);
        }

        $listMapper
            ->add('updatedAt', 'datetime', ['label' => 'global.maj'])
            ->add('_action', 'actions', [
                'label' => 'link_actions',
                'actions' => $availableActions,
            ]);
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $subject = $this->getSubject();

        if ($subject instanceof EventComment) {
            $formMapper->add('event', ModelType::class, [
                'label' => 'admin.fields.comment.idea',
                'class' => Event::class,
            ]);
        } elseif ($subject instanceof PostComment) {
            $formMapper->add('post', ModelType::class, [
                'label' => 'admin.fields.comment.idea',
                'class' => Post::class,
            ]);
        }

        $isModerationEnabled = $this->manager->isActive(Manager::moderation_comment);

        $formMapper
            ->add('body', null, ['label' => 'global.contenu', 'attr' => ['rows' => 8]])
            ->add('author', null, [
                'label' => 'global.author',
            ])
            ->add('authorName', null, ['label' => 'admin.fields.comment.author_name'])
            ->add('authorEmail', null, ['label' => 'admin.fields.comment.author_email'])
            ->add('published', null, [
                'label' => 'global.published',
                'disabled' => true,
                'attr' => ['readonly' => true],
            ]);

        $isAuthorAdmin = $subject->getAuthor() ? $subject->getAuthor()->isAdmin() : false;
        $doesRelatedObjectBelongsToProjectAdmin = $subject->getAuthor()
            ? $subject->doesRelatedObjectBelongsToProjectAdmin($subject->getAuthor())
            : false;

        if ($isModerationEnabled && !$isAuthorAdmin && !$doesRelatedObjectBelongsToProjectAdmin) {
            $formMapper->add('moderationStatus', ChoiceType::class, [
                'label' => $this->translator->trans('moderation'),
                'choices' => [
                    $this->translator->trans('pending') => 'PENDING',
                    $this->translator->trans('approved') => 'APPROVED',
                    $this->translator->trans('rejected') => 'REJECTED',
                ],
            ]);
        }

        $formMapper
            ->add('trashedStatus', TrashedStatusType::class, [
                'label' => 'global.is_trashed',
            ])
            ->add('trashedReason', null, ['label' => 'admin.fields.comment.trashed_reason'])
            ->add('pinned', null, ['label' => 'admin.fields.comment.pinned', 'required' => false]);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['batch', 'list', 'create', 'edit', 'delete', 'show']);
    }
}
