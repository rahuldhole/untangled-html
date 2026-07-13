<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';

	export let user = {
		name: 'Alex Developer',
		role: 'Frontend Engineer',
		avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
		status: 'Online'
	};

	let expanded = false;
	const dispatch = createEventDispatcher();

	function toggleExpand() {
		expanded = !expanded;
		dispatch('toggle', { expanded });
	}
</script>

<div class="card" transition:fade>
	<div class="header">
		<div class="avatar-container">
			<img src={user.avatar} alt="{user.name}'s avatar" class="avatar" />
			<span class="status-indicator" class:online={user.status === 'Online'}></span>
		</div>
		
		<div class="info">
			<h2>{user.name}</h2>
			<p class="role">{user.role}</p>
		</div>

		<button class="action-btn" on:click={toggleExpand} aria-expanded={expanded}>
			{#if expanded}
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M18 15l-6-6-6 6"/>
				</svg>
			{:else}
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M6 9l6 6 6-6"/>
				</svg>
			{/if}
		</button>
	</div>

	{#if expanded}
		<div class="details" transition:slide={{ duration: 300 }}>
			<div class="stats">
				<div class="stat">
					<strong>142</strong>
					<span>Commits</span>
				</div>
				<div class="stat">
					<strong>28</strong>
					<span>Repos</span>
				</div>
				<div class="stat">
					<strong>1.2k</strong>
					<span>Stars</span>
				</div>
			</div>
			
			<div class="actions">
				<button class="btn btn-primary">Follow</button>
				<button class="btn btn-outline">Message</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.card {
		background: #ffffff;
		border-radius: 16px;
		padding: 20px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		max-width: 400px;
		font-family: system-ui, -apple-system, sans-serif;
	}
	
	h2 {
		margin: 0 0 4px 0;
		font-size: 1.25rem;
		color: #1a1a1a;
	}
</style>
