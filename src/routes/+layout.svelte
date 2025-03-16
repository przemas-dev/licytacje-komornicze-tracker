<script lang="ts">
	import '../app.css';
	import { enhance } from '$app/forms';
	let { children, data, form } = $props();
	let loading = $state(false);
</script>

<div class="navbar bg-base-100 shadow-sm">
	<div class="flex-1">
		<a href="/" class="btn btn-ghost text-xl">Licytacje komornicze Tracker</a>
	</div>
	<div class="flex gap-2">
		{#if data?.email}
			<span class="text-accent">Logged as {data.email}</span>
		{:else}
			{#if !form?.codeSent}
				<form
					action="?/sendCode"
					method="post"
					use:enhance={() => {
						loading = true;
						return async ({ update }) => {
							await update();
							loading = false;
						};
					}}
				>
					<input type="email" name="email" placeholder="example@mail.com" class="input w-auto" disabled={loading} />
					{#if form?.error}<span class="text-error">{form.error}</span>{/if}
					<button class="btn" type="submit">Send code</button>
				</form>
			{/if}

			{#if form?.codeSent}
				<form
					action="?/login"
					method="post"
					use:enhance={() => {
						loading = true;

						return async ({ update }) => {
							await update();
							loading = false;
						};
					}}
				>
					<input type="text" name="code" autocomplete='off' disabled={loading} class="input w-auto"/>
					{#if form?.error}<span class="text-error">{form.error}</span>{/if}
					<button class="btn" type="submit">Login</button>
				</form>
			{/if}
		{/if}
	</div>
</div>

<div class="container mx-auto py-5">
	{@render children()}
</div>


